import styles from "./BudgetTrack.module.css";

export type TrackSegment = { key: string | number; width: string; color: string };

export function BudgetTrack({ segments = [] }: { segments?: TrackSegment[] }) {
  return (
    <div className={styles.track} aria-hidden="true">
      {segments.map((segment) => (
        <div
          key={segment.key}
          className={styles.segment}
          style={{ width: segment.width, background: segment.color }}
        />
      ))}
    </div>
  );
}
