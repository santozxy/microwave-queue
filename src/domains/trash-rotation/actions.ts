import "server-only";

import {
  buildTrashWeekSnapshot,
  readTrashRotationData,
  writeTrashRotationData,
} from "./server";
import {
  TrashRotationError,
  getWeekKey,
  normalizeParticipants,
  type TrashAssignment,
  type TrashRotationData,
} from "./types";

export async function createTrashAssignment(
  selectedDate: string,
  participants: string[],
) {
  const data = await readTrashRotationData();
  const normalizedParticipants = normalizeParticipants(participants);

  if (normalizedParticipants.length === 0) {
    throw new TrashRotationError(
      "Selecione pelo menos uma pessoa elegível para o rodízio.",
    );
  }

  const weekKey = getWeekKey(selectedDate);
  const existingAssignment = data.assignments.find(
    (assignment) => assignment.date === selectedDate,
  );

  if (existingAssignment) {
    throw new TrashRotationError(
      `O dia ${selectedDate} já está atribuído para ${existingAssignment.assignee}.`,
      409,
    );
  }

  const assignedThisWeek = new Set(
    data.assignments
      .filter((assignment) => assignment.weekKey === weekKey)
      .map((assignment) => assignment.assignee),
  );

  const eligibleParticipants = normalizedParticipants.filter(
    (participant) => !assignedThisWeek.has(participant),
  );

  if (eligibleParticipants.length === 0) {
    throw new TrashRotationError(
      "Todas as pessoas selecionadas já levaram o lixo nesta semana.",
    );
  }

  const assignee =
    eligibleParticipants[Math.floor(Math.random() * eligibleParticipants.length)];

  const newAssignment: TrashAssignment = {
    assignee,
    createdAt: new Date().toISOString(),
    date: selectedDate,
    participants: normalizedParticipants,
    weekKey,
  };

  const nextData: TrashRotationData = {
    assignments: [...data.assignments, newAssignment].sort((left, right) =>
      left.date.localeCompare(right.date),
    ),
  };

  await writeTrashRotationData(nextData);

  return {
    assignment: newAssignment,
    snapshot: buildTrashWeekSnapshot(selectedDate, nextData.assignments),
  };
}
