import type { ReactNode } from "react";
import styles from "./PageContent.module.css";

type PageContentProps = {
  tight?: boolean;
  children: ReactNode;
};

export function PageContent({ tight, children }: PageContentProps) {
  return <main className={`${styles.content} ${tight ? styles.tight : ""}`}>{children}</main>;
}
