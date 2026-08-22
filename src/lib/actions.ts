"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export type ActionState = { error: string | null };

function parseDateInputAsLocalMidnight(dateStr: string): Date {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day);
}

async function requireTeacherId(): Promise<string> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/login");
  }
  return session.user.id;
}

export async function registerTeacher(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!name || !email || password.length < 8) {
    return { error: "Name, email, and a password of at least 8 characters are required." };
  }

  const existing = await prisma.teacher.findUnique({ where: { email } });
  if (existing) {
    return { error: "An account with that email already exists." };
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.teacher.create({
    data: { name, email, passwordHash },
  });

  redirect("/login?registered=1");
}

export async function createStudent(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const teacherId = await requireTeacherId();
  const name = String(formData.get("name") ?? "").trim();
  const grade = String(formData.get("grade") ?? "").trim();

  if (!name || !grade) {
    return { error: "Student name and grade are required." };
  }

  await prisma.student.create({
    data: { name, grade, teacherId },
  });

  revalidatePath("/dashboard");
  return { error: null };
}

export async function deleteStudent(studentId: string) {
  const teacherId = await requireTeacherId();
  await prisma.student.deleteMany({ where: { id: studentId, teacherId } });
  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export async function updateStudentGrade(
  studentId: string,
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const teacherId = await requireTeacherId();

  const student = await prisma.student.findFirst({
    where: { id: studentId, teacherId },
  });
  if (!student) return { error: "Student not found." };

  const grade = String(formData.get("grade") ?? "").trim();
  if (!grade) return { error: "Grade is required." };

  await prisma.student.update({ where: { id: studentId }, data: { grade } });

  revalidatePath(`/students/${studentId}`);
  revalidatePath("/dashboard");
  return { error: null };
}

export async function createGoal(
  studentId: string,
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const teacherId = await requireTeacherId();

  const student = await prisma.student.findFirst({
    where: { id: studentId, teacherId },
  });
  if (!student) return { error: "Student not found." };

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();

  if (!title) return { error: "Goal title is required." };

  await prisma.goal.create({
    data: { title, description: description || null, studentId },
  });

  revalidatePath(`/students/${studentId}`);
  return { error: null };
}

export async function toggleGoalArchived(goalId: string, archived: boolean) {
  const teacherId = await requireTeacherId();
  const goal = await prisma.goal.findFirst({
    where: { id: goalId, student: { teacherId } },
  });
  if (!goal) throw new Error("Goal not found.");

  await prisma.goal.update({ where: { id: goalId }, data: { archived } });
  revalidatePath(`/students/${goal.studentId}`);
  revalidatePath(`/goals/${goalId}`);
}

export async function deleteGoal(goalId: string) {
  const teacherId = await requireTeacherId();
  const goal = await prisma.goal.findFirst({
    where: { id: goalId, student: { teacherId } },
  });
  if (!goal) throw new Error("Goal not found.");

  await prisma.goal.delete({ where: { id: goalId } });
  revalidatePath(`/students/${goal.studentId}`);
  redirect(`/students/${goal.studentId}`);
}

export async function addProgressEntry(
  goalId: string,
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const teacherId = await requireTeacherId();
  const goal = await prisma.goal.findFirst({
    where: { id: goalId, student: { teacherId } },
  });
  if (!goal) return { error: "Goal not found." };

  const percent = Number(formData.get("percent"));
  const note = String(formData.get("note") ?? "").trim();
  const recordedAtRaw = String(formData.get("recordedAt") ?? "");

  if (!Number.isInteger(percent) || percent < 0 || percent > 100 || percent % 10 !== 0) {
    return { error: "Percent complete must be in 10% increments between 0 and 100." };
  }

  await prisma.progressEntry.create({
    data: {
      goalId,
      percent,
      note: note || null,
      recordedAt: recordedAtRaw ? parseDateInputAsLocalMidnight(recordedAtRaw) : new Date(),
    },
  });

  revalidatePath(`/goals/${goalId}`);
  revalidatePath(`/students/${goal.studentId}`);
  revalidatePath("/dashboard");
  return { error: null };
}

export async function deleteProgressEntry(entryId: string) {
  const teacherId = await requireTeacherId();
  const entry = await prisma.progressEntry.findFirst({
    where: { id: entryId, goal: { student: { teacherId } } },
    include: { goal: true },
  });
  if (!entry) throw new Error("Entry not found.");

  await prisma.progressEntry.delete({ where: { id: entryId } });
  revalidatePath(`/goals/${entry.goalId}`);
  revalidatePath(`/students/${entry.goal.studentId}`);
  revalidatePath("/dashboard");
}
