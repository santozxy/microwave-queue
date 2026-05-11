import "server-only";

import {
  BlobNotFoundError,
  BlobPreconditionFailedError,
  get,
  head,
  put,
} from "@vercel/blob";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { employees } from "@/lib/employees";

import {
  getTodayIsoDate,
  getWeekDates,
  getWeekKey,
  TrashRotationError,
  type TrashAssignment,
  type TrashRotationData,
  type TrashWeekSnapshot,
} from "./types";

const blobPathname = "trash-rotation/data.json";
const isBlobEnabled = Boolean(process.env.BLOB_READ_WRITE_TOKEN);
const isVercelRuntime = process.env.VERCEL === "1";
const dataFilePath = path.join(process.cwd(), "data", "trash-rotation.json");
const initialData: TrashRotationData = { assignments: [] };

function assertStorageIsConfigured() {
  if (isVercelRuntime && !isBlobEnabled) {
    throw new TrashRotationError(
      "Configure a variável BLOB_READ_WRITE_TOKEN na Vercel para usar o rodízio em produção.",
      500,
    );
  }
}

async function ensureDataFile() {
  await mkdir(path.dirname(dataFilePath), { recursive: true });

  try {
    await readFile(dataFilePath, "utf-8");
  } catch {
    await writeFile(
      dataFilePath,
      JSON.stringify(initialData, null, 2),
      "utf-8",
    );
  }
}

async function readBlobData() {
  let blobResult: Awaited<ReturnType<typeof get>>;

  try {
    blobResult = await get(blobPathname, { access: "private" });
  } catch (error) {
    if (error instanceof BlobNotFoundError) {
      return initialData;
    }

    throw error;
  }

  if (!blobResult || blobResult.statusCode !== 200 || !blobResult.stream) {
    return initialData;
  }

  const fileContents = await new Response(blobResult.stream).text();

  if (!fileContents.trim()) {
    return initialData;
  }

  const parsed = JSON.parse(fileContents) as Partial<TrashRotationData>;

  return {
    assignments: Array.isArray(parsed.assignments) ? parsed.assignments : [],
  } satisfies TrashRotationData;
}

export async function readTrashRotationData() {
  assertStorageIsConfigured();

  if (isBlobEnabled) {
    return readBlobData();
  }

  await ensureDataFile();

  const fileContents = await readFile(dataFilePath, "utf-8");
  const parsed = JSON.parse(fileContents) as Partial<TrashRotationData>;

  return {
    assignments: Array.isArray(parsed.assignments) ? parsed.assignments : [],
  } satisfies TrashRotationData;
}

export async function writeTrashRotationData(data: TrashRotationData) {
  assertStorageIsConfigured();

  if (isBlobEnabled) {
    await writeBlobData(data);
    return;
  }

  await ensureDataFile();
  await writeFile(dataFilePath, JSON.stringify(data, null, 2), "utf-8");
}

async function writeBlobData(
  data: TrashRotationData,
  retryCount = 0,
): Promise<void> {
  try {
    const currentMetadata = await head(blobPathname);

    await put(blobPathname, JSON.stringify(data, null, 2), {
      access: "private",
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: "application/json",
      ifMatch: currentMetadata.etag,
    });
  } catch (error) {
    if (error instanceof BlobNotFoundError) {
      await put(blobPathname, JSON.stringify(data, null, 2), {
        access: "private",
        addRandomSuffix: false,
        contentType: "application/json",
      });
      return;
    }

    if (error instanceof BlobPreconditionFailedError && retryCount < 1) {
      await writeBlobData(data, retryCount + 1);
      return;
    }

    throw error;
  }
}

export function buildTrashWeekSnapshot(
  selectedDate: string,
  assignments: TrashAssignment[],
): TrashWeekSnapshot {
  const weekKey = getWeekKey(selectedDate);
  const weekDates = getWeekDates(selectedDate);
  const weekAssignments = assignments
    .filter((assignment) => assignment.weekKey === weekKey)
    .sort((left, right) => left.date.localeCompare(right.date));
  const assignedParticipants = Array.from(
    new Set(weekAssignments.map((assignment) => assignment.assignee)),
  );

  return {
    allParticipants: employees,
    assignedParticipants,
    assignments: weekAssignments,
    availableParticipants: employees.filter(
      (participant) => !assignedParticipants.includes(participant),
    ),
    selectedDate,
    weekDates,
    weekKey,
  };
}

export async function getTrashWeekSnapshot(selectedDate: string) {
  const data = await readTrashRotationData();
  return buildTrashWeekSnapshot(selectedDate, data.assignments);
}

export { getTodayIsoDate };
