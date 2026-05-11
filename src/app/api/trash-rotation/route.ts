import { NextRequest, NextResponse } from "next/server";

import {
  createTrashAssignment,
  removeTrashAssignment,
} from "@/domains/trash-rotation/actions";
import {
  getTodayIsoDate,
  getTrashWeekSnapshot,
} from "@/domains/trash-rotation/server";
import { TrashRotationError } from "@/domains/trash-rotation/types";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const selectedDate =
    request.nextUrl.searchParams.get("date") ?? getTodayIsoDate();

  try {
    const snapshot = await getTrashWeekSnapshot(selectedDate);
    return NextResponse.json(snapshot);
  } catch (error) {
    const status = error instanceof TrashRotationError ? error.status : 400;
    const message =
      error instanceof Error ? error.message : "Não foi possível carregar a semana.";
    return NextResponse.json({ message }, { status });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      assignee?: string;
      date?: string;
      participants?: string[];
    };

    if (!body.date) {
      throw new TrashRotationError("Informe a data para registrar o rodízio.");
    }

    const result = await createTrashAssignment(
      body.date,
      Array.isArray(body.participants) ? body.participants : [],
      body.assignee,
    );

    return NextResponse.json(
      {
        assignment: result.assignment,
        message: `${result.assignment.assignee} ficou responsável pelo lixo no dia selecionado.`,
        snapshot: result.snapshot,
      },
      { status: 201 },
    );
  } catch (error) {
    const status = error instanceof TrashRotationError ? error.status : 400;
    const message =
      error instanceof Error ? error.message : "Não foi possível salvar o rodízio.";

    return NextResponse.json({ message }, { status });
  }
}

export async function DELETE(request: NextRequest) {
  const selectedDate = request.nextUrl.searchParams.get("date");

  try {
    if (!selectedDate) {
      throw new TrashRotationError("Informe a data para remover o rodízio.");
    }

    const result = await removeTrashAssignment(selectedDate);

    return NextResponse.json({
      message: `${result.removedAssignment.assignee} foi removido do dia selecionado.`,
      removedAssignment: result.removedAssignment,
      snapshot: result.snapshot,
    });
  } catch (error) {
    const status = error instanceof TrashRotationError ? error.status : 400;
    const message =
      error instanceof Error ? error.message : "Não foi possível remover o rodízio.";

    return NextResponse.json({ message }, { status });
  }
}
