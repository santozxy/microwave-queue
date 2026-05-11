"use client";

import { useEffect, useMemo, useState } from "react";

import {
  createTrashAssignmentRequest,
  fetchTrashWeekSnapshot,
  getTodayIsoDate,
  removeTrashAssignmentRequest,
} from "@/domains/trash-rotation/client";
import {
  createTrashWeekSnapshot,
  type TrashAssignment,
  type TrashWeekSnapshot,
} from "@/domains/trash-rotation/types";

import { DaysPanel } from "./components/days-panel";
import { ParticipantsPanel } from "./components/participants-panel";

function shiftIsoDateByDays(date: string, amount: number) {
  const shiftedDate = new Date(`${date}T12:00:00Z`);
  shiftedDate.setUTCDate(shiftedDate.getUTCDate() + amount);
  return shiftedDate.toISOString().slice(0, 10);
}

function formatWeekRange(weekDates: string[]) {
  if (weekDates.length === 0) {
    return "";
  }

  const formatter = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "UTC",
  });

  return `${formatter.format(new Date(`${weekDates[0]}T12:00:00Z`))} até ${formatter.format(new Date(`${weekDates[6]}T12:00:00Z`))}`;
}

function formatWeekDateLabel(date: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "UTC",
    weekday: "short",
  }).format(new Date(`${date}T12:00:00Z`));
}

function formatWeekday(date: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: "UTC",
    weekday: "short",
  }).format(new Date(`${date}T12:00:00Z`));
}

function formatMonthDay(date: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "UTC",
  }).format(new Date(`${date}T12:00:00Z`));
}

export function TrashRotation() {
  const [selectedDate, setSelectedDate] = useState(getTodayIsoDate);
  const [selectedPeople, setSelectedPeople] = useState<string[]>([]);
  const [weekSnapshot, setWeekSnapshot] = useState<TrashWeekSnapshot | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const assignedParticipants = useMemo(
    () => new Set(weekSnapshot?.assignedParticipants ?? []),
    [weekSnapshot],
  );

  const currentAssignment = weekSnapshot?.assignments.find(
    (assignment) => assignment.date === selectedDate,
  );
  const selectedWeekRange = weekSnapshot
    ? formatWeekRange(weekSnapshot.weekDates)
    : "Carregando semana...";
  const assignedCount = weekSnapshot?.assignments.length ?? 0;
  const availableCount =
    weekSnapshot?.availableParticipants.length ?? 0;

  async function loadWeek(date: string) {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const data = await fetchTrashWeekSnapshot(date);
      setWeekSnapshot(data);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Não foi possível carregar os registros.";
      setErrorMessage(message);
      setWeekSnapshot(null);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadWeek(selectedDate);
  }, [selectedDate]);

  useEffect(() => {
    if (!weekSnapshot) {
      return;
    }

    setSelectedPeople((currentSelection) =>
      currentSelection.filter((person) =>
        weekSnapshot.availableParticipants.includes(person),
      ),
    );
  }, [weekSnapshot]);

  const handlePersonToggle = (person: string) => {
    if (assignedParticipants.has(person)) {
      return;
    }

    setSelectedPeople((currentSelection) =>
      currentSelection.includes(person)
        ? currentSelection.filter((item) => item !== person)
        : [...currentSelection, person],
    );
  };

  const selectAllEligible = () => {
    setSelectedPeople(weekSnapshot?.availableParticipants ?? []);
  };

  const clearSelection = () => {
    setSelectedPeople([]);
  };

  const handleSelectDate = (date: string) => {
    setSelectedDate(date);
    setFeedbackMessage(null);
    setErrorMessage(null);
  };

  const goToPreviousWeek = () => {
    handleSelectDate(shiftIsoDateByDays(selectedDate, -7));
  };

  const goToNextWeek = () => {
    handleSelectDate(shiftIsoDateByDays(selectedDate, 7));
  };

  const buildOptimisticSnapshot = (assignments: TrashAssignment[]) =>
    createTrashWeekSnapshot(selectedDate, assignments);

  const handleGenerateAssignment = async () => {
    if (selectedPeople.length === 0 || !weekSnapshot) {
      return;
    }

    const eligibleParticipants = selectedPeople.filter(
      (person) => !assignedParticipants.has(person),
    );

    if (eligibleParticipants.length === 0) {
      return;
    }

    const optimisticAssignee =
      eligibleParticipants[
        Math.floor(Math.random() * eligibleParticipants.length)
      ];
    const previousSnapshot = weekSnapshot;
    const previousSelection = selectedPeople;
    const optimisticAssignment: TrashAssignment = {
      assignee: optimisticAssignee,
      createdAt: new Date().toISOString(),
      date: selectedDate,
      participants: selectedPeople,
      weekKey: weekSnapshot.weekKey,
    };
    const optimisticSnapshot = buildOptimisticSnapshot([
      ...weekSnapshot.assignments.filter(
        (assignment) => assignment.date !== selectedDate,
      ),
      optimisticAssignment,
    ]);

    setIsSaving(true);
    setErrorMessage(null);
    setFeedbackMessage(null);
    setWeekSnapshot(optimisticSnapshot);
    setSelectedPeople([]);

    try {
      const data = await createTrashAssignmentRequest(
        selectedDate,
        selectedPeople,
        optimisticAssignee,
      );

      setFeedbackMessage(data.message ?? "Rodízio salvo com sucesso.");

      if (data.snapshot) {
        setWeekSnapshot(data.snapshot);
      } else {
        await loadWeek(selectedDate);
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Não foi possível salvar o rodízio.";
      setWeekSnapshot(previousSnapshot);
      setSelectedPeople(previousSelection);
      setErrorMessage(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveAssignment = async () => {
    if (!currentAssignment || !weekSnapshot) {
      return;
    }

    const previousSnapshot = weekSnapshot;
    const optimisticSnapshot = buildOptimisticSnapshot(
      weekSnapshot.assignments.filter(
        (assignment) => assignment.date !== selectedDate,
      ),
    );

    setIsRemoving(true);
    setErrorMessage(null);
    setFeedbackMessage(null);
    setWeekSnapshot(optimisticSnapshot);

    try {
      const data = await removeTrashAssignmentRequest(selectedDate);
      setFeedbackMessage(data.message ?? "Responsável removido com sucesso.");

      if (data.snapshot) {
        setWeekSnapshot(data.snapshot);
      } else {
        await loadWeek(selectedDate);
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Não foi possível remover o rodízio.";
      setWeekSnapshot(previousSnapshot);
      setErrorMessage(message);
    } finally {
      setIsRemoving(false);
    }
  };

  const days =
    weekSnapshot?.weekDates.map((date) => {
      const assignment = weekSnapshot.assignments.find(
        (item) => item.date === date,
      );

      return {
        assignee: assignment?.assignee,
        date,
        dayLabel: formatWeekday(date),
        fullLabel: formatWeekDateLabel(date),
        isSelected: date === selectedDate,
        monthDayLabel: formatMonthDay(date),
      };
    }) ?? [];

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <ParticipantsPanel
        availableCount={availableCount}
        currentAssignmentExists={currentAssignment !== undefined}
        errorMessage={errorMessage}
        feedbackMessage={feedbackMessage}
        isAssigned={(person) => assignedParticipants.has(person)}
        isLoading={isLoading}
        isRemoving={isRemoving}
        isSaving={isSaving}
        isSelected={(person) => selectedPeople.includes(person)}
        onClearSelection={clearSelection}
        onGenerateAssignment={handleGenerateAssignment}
        onSelectAllEligible={selectAllEligible}
        onTogglePerson={handlePersonToggle}
        selectedPeopleCount={selectedPeople.length}
      />

      <DaysPanel
        assignedCount={assignedCount}
        currentAssignment={currentAssignment}
        days={days}
        isLoading={isLoading}
        isRemoving={isRemoving}
        isSaving={isSaving}
        onLoadWeek={() =>  loadWeek(selectedDate)}
        onNextWeek={goToNextWeek}
        onPreviousWeek={goToPreviousWeek}
        onRemoveAssignment={handleRemoveAssignment}
        onSelectDate={handleSelectDate}
        selectedWeekRange={selectedWeekRange}
        weekLoaded={days.length > 0}
      />
    </div>
  );
}
