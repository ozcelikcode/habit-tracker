import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { errors } from '../lib/errors';
import { parseDateOrFail, isToday } from '../lib/dates';

const frequencyValues = ['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY', 'CUSTOM'] as const;

const habitBaseSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  frequency: z.enum(frequencyValues),
  customRule: z.string().max(2000).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  timezone: z.string().max(64).optional(),
});

const habitUpdateSchema = habitBaseSchema.partial();

export const habitRoutes: FastifyPluginAsync = async (app) => {
  app.addHook('preHandler', app.verifyAuth);

  app.get('/habits', async (request, reply) => {
    const userId = request.user!.id;
    const habits = await app.prisma.habit.findMany({
      where: { userId, deletedAt: null },
      include: { streaks: true, logs: true },
      orderBy: { createdAt: 'desc' },
    });

    const payload = habits.map((h) => ({
      id: h.id,
      title: h.title,
      description: h.description,
      frequency: h.frequency,
      customRule: h.customRule,
      startDate: h.startDate,
      endDate: h.endDate,
      timezone: h.timezone,
      streak: h.streaks[0] ?? null,
      logCount: h.logs.length,
    }));

    return reply.send({ habits: payload });
  });

  app.post('/habits', async (request, reply) => {
    const parse = habitBaseSchema.safeParse(request.body);
    if (!parse.success) return errors.badRequest(reply, 'Invalid input', parse.error.flatten());
    const data = parse.data;
    const userId = request.user!.id;

    const created = await app.prisma.habit.create({
      data: {
        userId,
        title: data.title,
        description: data.description,
        frequency: data.frequency,
        customRule: data.customRule,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
        timezone: data.timezone ?? 'Europe/Istanbul',
      },
    });

    return reply.send({ habit: created });
  });

  app.get('/habits/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const userId = request.user!.id;

    const habit = await app.prisma.habit.findFirst({
      where: { id, userId, deletedAt: null },
      include: { logs: { where: { deletedAt: null } }, streaks: true },
    });
    if (!habit) return errors.notFound(reply, 'Habit not found');

    return reply.send({ habit });
  });

  app.patch('/habits/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const userId = request.user!.id;
    const parse = habitUpdateSchema.safeParse(request.body);
    if (!parse.success) return errors.badRequest(reply, 'Invalid input', parse.error.flatten());

    const habit = await app.prisma.habit.findFirst({ where: { id, userId, deletedAt: null } });
    if (!habit) return errors.notFound(reply, 'Habit not found');

    const data = parse.data;
    const updated = await app.prisma.habit.update({
      where: { id },
      data: {
        title: data.title ?? habit.title,
        description: data.description ?? habit.description,
        frequency: data.frequency ?? habit.frequency,
        customRule: data.customRule ?? habit.customRule,
        startDate: data.startDate ? new Date(data.startDate) : habit.startDate,
        endDate: data.endDate ? new Date(data.endDate) : habit.endDate,
        timezone: data.timezone ?? habit.timezone,
      },
    });

    return reply.send({ habit: updated });
  });

  app.delete('/habits/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const userId = request.user!.id;
    const habit = await app.prisma.habit.findFirst({ where: { id, userId, deletedAt: null } });
    if (!habit) return errors.notFound(reply, 'Habit not found');

    await app.prisma.habit.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return reply.send({ ok: true });
  });

  // Logs
  const logCreateSchema = z.object({
    count: z.number().int().min(1).max(1000).default(1),
    note: z.string().max(2000).optional(),
    date: z.string().datetime().optional(),
  });

  app.post('/habits/:id/logs', async (request, reply) => {
    const { id } = request.params as { id: string };
    const userId = request.user!.id;
    const parse = logCreateSchema.safeParse(request.body ?? {});
    if (!parse.success) return errors.badRequest(reply, 'Invalid input', parse.error.flatten());
    const { count, note, date } = parse.data;

    const habit = await app.prisma.habit.findFirst({ where: { id, userId, deletedAt: null } });
    if (!habit) return errors.notFound(reply, 'Habit not found');

    const logDate = date ? parseDateOrFail(date) : new Date();
    if (!logDate) return errors.badRequest(reply, 'Invalid date');
    if (!isToday(logDate)) return errors.badRequest(reply, 'Backdating is not allowed');

    const created = await app.prisma.habitLog.create({
      data: {
        habitId: id,
        date: logDate,
        count,
        note,
      },
    });

    return reply.send({ log: created });
  });

  app.get('/habits/:id/logs', async (request, reply) => {
    const { id } = request.params as { id: string };
    const { from, to } = request.query as { from?: string; to?: string };
    const userId = request.user!.id;

    const habit = await app.prisma.habit.findFirst({ where: { id, userId, deletedAt: null } });
    if (!habit) return errors.notFound(reply, 'Habit not found');

    const filters: any = { deletedAt: null };
    if (from) {
      const d = parseDateOrFail(from);
      if (!d) return errors.badRequest(reply, 'Invalid from date');
      filters.date = { ...(filters.date || {}), gte: d };
    }
    if (to) {
      const d = parseDateOrFail(to);
      if (!d) return errors.badRequest(reply, 'Invalid to date');
      filters.date = { ...(filters.date || {}), lte: d };
    }

    const logs = await app.prisma.habitLog.findMany({
      where: { habitId: id, ...filters },
      orderBy: { date: 'desc' },
    });

    return reply.send({ logs });
  });

  app.delete('/logs/:logId', async (request, reply) => {
    const { logId } = request.params as { logId: string };
    const userId = request.user!.id;

    const log = await app.prisma.habitLog.findFirst({
      where: { id: logId, deletedAt: null },
      include: { habit: true },
    });
    if (!log || log.habit.userId !== userId) return errors.notFound(reply, 'Log not found');

    await app.prisma.habitLog.update({ where: { id: logId }, data: { deletedAt: new Date() } });
    return reply.send({ ok: true });
  });

  // Streak
  app.get('/habits/:id/streak', async (request, reply) => {
    const { id } = request.params as { id: string };
    const userId = request.user!.id;
    const habit = await app.prisma.habit.findFirst({
      where: { id, userId, deletedAt: null },
      include: { logs: { where: { deletedAt: null } } },
    });
    if (!habit) return errors.notFound(reply, 'Habit not found');

    const dates = new Set(habit.logs.map((l) => new Date(l.date).toDateString()));
    let streak = 0;
    let dayCursor = new Date();
    let missed = 0;
    while (true) {
      const dayKey = dayCursor.toDateString();
      if (dates.has(dayKey)) {
        streak += 1;
        missed = 0;
      } else {
        missed += 1;
        if (missed >= 3) break;
      }
      dayCursor.setDate(dayCursor.getDate() - 1);
    }

    return reply.send({ streak, lastActiveDate: habit.logs[0]?.date ?? null });
  });

  // Heatmap
  app.get('/habits/:id/heatmap', async (request, reply) => {
    const { id } = request.params as { id: string };
    const userId = request.user!.id;
    const habit = await app.prisma.habit.findFirst({
      where: { id, userId, deletedAt: null },
      include: { logs: { where: { deletedAt: null } } },
    });
    if (!habit) return errors.notFound(reply, 'Habit not found');

    const counts: Record<string, number> = {};
    habit.logs.forEach((l) => {
      const key = new Date(l.date).toISOString().split('T')[0];
      counts[key] = (counts[key] ?? 0) + l.count;
    });

    const entries = Object.entries(counts).map(([date, count]) => ({ date, count }));
    return reply.send({ days: entries });
  });

  // Export/Import
  app.post('/export', async (request, reply) => {
    const userId = request.user!.id;
    const habits = await app.prisma.habit.findMany({
      where: { userId, deletedAt: null },
      include: { logs: { where: { deletedAt: null } } },
    });
    return reply.send({ habits });
  });

  const importSchema = z.object({
    habits: z
      .array(
        z.object({
          title: z.string().min(1),
          description: z.string().optional(),
          frequency: z.enum(frequencyValues),
          customRule: z.string().optional(),
          startDate: z.string().optional(),
          endDate: z.string().optional(),
          timezone: z.string().optional(),
          logs: z
            .array(
              z.object({
                date: z.string(),
                count: z.number().int().min(1).default(1),
                note: z.string().optional(),
              })
            )
            .optional(),
        })
      )
      .default([]),
  });

  app.post('/import', async (request, reply) => {
    const parse = importSchema.safeParse(request.body);
    if (!parse.success) return errors.badRequest(reply, 'Invalid input', parse.error.flatten());
    const userId = request.user!.id;

    const results: string[] = [];
    for (const h of parse.data.habits) {
      const habit = await app.prisma.habit.create({
        data: {
          userId,
          title: h.title,
          description: h.description,
          frequency: h.frequency,
          customRule: h.customRule,
          startDate: h.startDate ? new Date(h.startDate) : undefined,
          endDate: h.endDate ? new Date(h.endDate) : undefined,
          timezone: h.timezone ?? 'Europe/Istanbul',
        },
      });
      results.push(habit.id);
      if (h.logs?.length) {
        for (const log of h.logs) {
          const d = parseDateOrFail(log.date);
          if (!d) continue;
          await app.prisma.habitLog.create({
            data: {
              habitId: habit.id,
              date: d,
              count: log.count ?? 1,
              note: log.note,
            },
          });
        }
      }
    }

    return reply.send({ importedHabits: results.length });
  });
};
