import type { ReactNode } from "react";

type ButtonSwooshContentProps = {
  children?: ReactNode;
  text: string;
};

export default function ButtonSwooshContent({
  children,
  text,
}: ButtonSwooshContentProps) {
  return (
    <>
      <span className="button-swoosh__bg" aria-hidden="true" />
      <span className="button-swoosh__inner" data-text={text}>
        <span className="button-swoosh__text">{children ?? text}</span>
      </span>
    </>
  );
}
