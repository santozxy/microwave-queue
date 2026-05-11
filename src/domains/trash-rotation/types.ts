import { employees } from "@/lib/employees";

export interface TrashAssignment {
  assignee: string;
  createdAt: string;
  date: string;
  participants: string[];
  weekKey: string;
}

export interface TrashRotationData {
  assignments: TrashAssignment[];
}

export interface TrashWeekSnapshot {
  allParticipants: string[];
  assignedParticipants: string[];
  assignments: TrashAssignment[];
  availableParticipants: string[];
  selectedDate: string;
  weekDates: string[];
  weekKey: string;
}

export class TrashRotationError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = "TrashRotationError";
    this.status = status;
  }
}

const isoDatePattern = /^\d{4}-\d{2}-\d{2}$/;

export function getTodayIsoDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function parseIsoDate(value: string) {
  if (!isoDatePattern.test(value)) {
    throw new Error("A data deve estar no formato YYYY-MM-DD.");
  }

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    throw new Error("A data informada não é válida.");
  }

  return date;
}

export function formatUtcDateToIso(value: Date) {
  return value.toISOString().slice(0, 10);
}

export function getWeekKey(date: string) {
  const parsedDate = parseIsoDate(date);
  const utcDay = parsedDate.getUTCDay();
  const dayOfWeek = utcDay === 0 ? 7 : utcDay;

  parsedDate.setUTCDate(parsedDate.getUTCDate() - dayOfWeek + 1);

  return formatUtcDateToIso(parsedDate);
}

export function getWeekDates(date: string) {
  const weekStart = parseIsoDate(getWeekKey(date));

  return Array.from({ length: 7 }, (_, index) => {
    const currentDate = new Date(weekStart);
    currentDate.setUTCDate(weekStart.getUTCDate() + index);
    return formatUtcDateToIso(currentDate);
  });
}

export function normalizeParticipants(participants: string[]) {
  return Array.from(
    new Set(participants.filter((participant) => employees.includes(participant))),
  );
}

export function createTrashWeekSnapshot(
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
