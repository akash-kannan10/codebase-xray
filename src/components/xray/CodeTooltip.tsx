import { useState } from "react";

const DEFINITIONS: Record<string, string> = {
  Controller: "Handles incoming requests and sends responses. The traffic cop of your app.",
  "Service Layer": "Contains business logic. Keeps controllers thin and code reusable.",
  Model: "Defines data structure. Talks directly to the database.",
  Route: "Maps URLs to controller functions. Defines your app's API surface.",
  "Entry Point": "The file Node.js runs first. Usually app.js or server.js.",
  Dependency: "An external package your project relies on from npm.",
  Coupling: "How tightly connected your files are. High coupling = harder to change.",
};

interface Props {
  term: string;
  children: React.ReactNode;
}

const CodeTooltip = ({ term, children }: Props) => {
  const [show, setShow] = useState(false);
  const definition = DEFINITIONS[term];

  if (!definition) {
    return <span className="text-foreground font-medium">{children}</span>;
  }

  return (
    <span
      className="relative inline-block"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      <span className="text-primary font-medium border-b border-dashed border-primary/50 cursor-help">
        {children}
      </span>
      {show && (
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 text-xs rounded-lg bg-foreground text-background max-w-[220px] text-center z-50 animate-fade-in whitespace-normal">
          <strong>{term}:</strong> {definition}
          <span className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-foreground" />
        </span>
      )}
    </span>
  );
};

export default CodeTooltip;
