import "server-only";

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { employees } from "@/lib/employees";

import {
  getTodayIsoDate,
  getWeekDates,
  getWeekKey,
  type TrashAssignment,
  type TrashRotationData,
  type TrashWeekSnapshot,
} from "./types";

const dataFilePath = path.join(process.cwd(), "data", "trash-rotation.json");

async function ensureDataFile() {
  await mkdir(path.dirname(dataFilePath), { recursive: true });

  try {
    await readFile(dataFilePath, "utf-8");
  } catch {
    const initialData: TrashRotationData = { assignments: [] };
    await writeFile(dataFilePath, JSON.stringify(initialData, null, 2), "utf-8");
  }
}

export async function readTrashRotationData() {
  await ensureDataFile();

  const fileContents = await readFile(dataFilePath, "utf-8");
  const parsed = JSON.parse(fileContents) as Partial<TrashRotationData>;

  return {
    assignments: Array.isArray(parsed.assignments) ? parsed.assignments : [],
  } satisfies TrashRotationData;
}

export async function writeTrashRotationData(data: TrashRotationData) {
  await ensureDataFile();
  await writeFile(dataFilePath, JSON.stringify(data, null, 2), "utf-8");
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
