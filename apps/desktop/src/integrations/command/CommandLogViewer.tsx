import type { CommandEvent } from "./commandTypes";

type CommandLogViewerProps = {
  events: CommandEvent[];
};

export function CommandLogViewer({ events }: CommandLogViewerProps) {
  const logEvents = events.filter(
    (event) => event.eventType === "stdout" || event.eventType === "stderr",
  );

  if (logEvents.length === 0) {
    return <div className="cp-empty">还没有日志输出。启动任务后会在这里显示 stdout / stderr。</div>;
  }

  return (
    <div className="command-log-viewer" aria-label="命令日志">
      {logEvents.map((event) => (
        <div
          key={event.id}
          className={`command-log-line command-log-${event.eventType}`}
        >
          <span>{event.eventType === "stderr" ? "stderr" : "stdout"}</span>
          <pre>{event.content}</pre>
        </div>
      ))}
    </div>
  );
}
