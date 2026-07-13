import { Badge } from "@/components/ui/Badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import {
  Table,
  TBody,
  TD,
  TH,
  THead,
  TR,
} from "@/components/ui/Table";
import { EmptyState } from "@/components/ui/EmptyState";
import { cn } from "@/lib/utils";
import type { ScoreResult, ScoreTrendPoint } from "@/lib/score/types";

const barColor = (score: number) =>
  score >= 75
    ? "bg-green-500"
    : score >= 40
      ? "bg-amber-500"
      : "bg-red-500";

export function ScoreBreakdown({
  result,
  history,
  currency,
}: {
  result: ScoreResult;
  history: ScoreTrendPoint[];
  currency: string;
}) {
  const maxScore = 100;
  const maxHistoryScore = Math.max(...history.map((p) => p.score), 1);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Score Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <THead>
                <TR>
                  <TH>Dimension</TH>
                  <TH>Current</TH>
                  <TH>Ideal</TH>
                  <TH>Weight</TH>
                  <TH>Contribution</TH>
                  <TH>Score</TH>
                </TR>
              </THead>
              <TBody>
                {result.dimensions.map((d) => (
                  <TR key={d.key}>
                    <TD className="font-medium">{d.name}</TD>
                    <TD>{d.currentLabel}</TD>
                    <TD>{d.idealLabel}</TD>
                    <TD>{`${d.weight}%`}</TD>
                    <TD>+{d.contribution}</TD>
                    <TD>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-24 rounded-full bg-neutral-200 dark:bg-neutral-800">
                          <div
                            className={cn("h-2 rounded-full", barColor(d.score))}
                            style={{ width: `${d.score}%` }}
                          />
                        </div>
                        <span className="text-xs">{d.score}</span>
                      </div>
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          {result.recommendations.length === 0 ? (
            <EmptyState
              title="Looking good"
              description="No recommendations right now."
            />
          ) : (
            <ul className="space-y-3">
              {result.recommendations.map((r, i) => (
                <li
                  key={i}
                  className="flex items-start justify-between gap-3 rounded-md border border-neutral-200 p-3 dark:border-neutral-800"
                >
                  <div>
                    <p className="text-sm text-neutral-900 dark:text-neutral-100">
                      {r.suggestion}
                    </p>
                    <p className="mt-1 text-xs text-neutral-500">
                      From {r.current} → {r.target}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge
                      variant={
                        r.priority === "high"
                          ? "danger"
                          : r.priority === "medium"
                            ? "warning"
                            : "default"
                      }
                    >
                      {r.priority}
                    </Badge>
                    <span className="text-xs text-green-600">
                      +{r.potentialGain} pts
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>History</CardTitle>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <EmptyState
              title="No history yet"
              description="Score history will appear here after a few months."
            />
          ) : (
            <div className="flex items-end gap-2 h-40">
              {history.map((p) => (
                <div
                  key={p.period}
                  className="flex flex-1 flex-col items-center gap-1"
                >
                  <div
                    className="w-full rounded-t bg-neutral-800 dark:bg-neutral-200"
                    style={{
                      height: `${(p.score / maxHistoryScore) * 100}%`,
                      minHeight: 4,
                    }}
                  />
                  <span className="text-[10px] text-neutral-500 truncate w-full text-center">
                    {p.period}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <p className="text-sm text-neutral-600 dark:text-neutral-400">
        Potential to gain +{result.estimatedPotentialGain} points.
      </p>
    </div>
  );
}
