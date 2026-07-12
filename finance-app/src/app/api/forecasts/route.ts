import { requireAuthed, json, handleError } from "@/lib/api";
import { listForecasts, saveForecast, type Db } from "@/lib/forecasting/repository";
import { generateForecast, type ForecastInput } from "@/lib/forecasting";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const user = await requireAuthed();
    const { searchParams } = new URL(req.url);
    const forecasts = await listForecasts(user.id);
    return json({ forecasts });
  } catch (e) {
    return handleError(e);
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireAuthed();
    const body = await req.json().catch(() => ({}));
    const { period, scenario, type, customDays } = body as Partial<ForecastInput>;

    if (!period || !scenario || !type) {
      return json({ error: "period, scenario, and type are required" }, 400);
    }

    const result = await generateForecast({
      userId: user.id,
      period: period as ForecastInput["period"],
      scenario: scenario as ForecastInput["scenario"],
      type: type as ForecastInput["type"],
      customDays,
    });

    await saveForecast(user.id, result);

    return json({ forecast: result }, 201);
  } catch (e) {
    return handleError(e);
  }
}
