"use client";

import { type CSSProperties, type RefObject, useCallback, useEffect, useId, useMemo, useRef, useState } from "react";

type PremiumSelectProps = {
  ariaLabel: string;
  name: string;
  options: readonly string[];
  placeholder: string;
  required?: boolean;
};

type PremiumMultiSelectProps = PremiumSelectProps;

function useSelectMenuStyle(isOpen: boolean, triggerRef: RefObject<HTMLButtonElement | null>) {
  const [menuStyle, setMenuStyle] = useState<CSSProperties>({});

  const updateMenuStyle = useCallback(() => {
    const trigger = triggerRef.current;

    if (!trigger) return;

    const rect = trigger.getBoundingClientRect();
    const viewportGap = 14;
    const menuGap = 8;
    const preferredHeight = 260;
    const belowSpace = window.innerHeight - rect.bottom - viewportGap;
    const aboveSpace = rect.top - viewportGap;
    const openUp = belowSpace < 190 && aboveSpace > belowSpace;
    const availableSpace = openUp ? aboveSpace : belowSpace;
    const maxHeight = Math.max(156, Math.min(preferredHeight, availableSpace - menuGap));
    const preferredTop = openUp ? rect.top - menuGap - maxHeight : rect.bottom + menuGap;
    const maxTop = window.innerHeight - viewportGap - maxHeight;

    setMenuStyle({
      left: rect.left,
      maxHeight,
      top: Math.max(viewportGap, Math.min(preferredTop, maxTop)),
      width: rect.width,
    });
  }, [triggerRef]);

  useEffect(() => {
    if (!isOpen) return;

    updateMenuStyle();
    window.addEventListener("resize", updateMenuStyle);
    window.addEventListener("scroll", updateMenuStyle, true);

    return () => {
      window.removeEventListener("resize", updateMenuStyle);
      window.removeEventListener("scroll", updateMenuStyle, true);
    };
  }, [isOpen, updateMenuStyle]);

  return menuStyle;
}

export function PremiumSelect({ ariaLabel, name, options, placeholder, required = false }: PremiumSelectProps) {
  const generatedId = useId();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [validationError, setValidationError] = useState("");
  const [value, setValue] = useState("");

  const selectedIndex = useMemo(() => options.findIndex((option) => option === value), [options, value]);
  const selectedLabel = value || placeholder;
  const listboxId = `${generatedId}-listbox`;
  const errorId = `${generatedId}-error`;
  const activeOptionId = isOpen && activeIndex >= 0 ? `${generatedId}-option-${activeIndex}` : undefined;
  const menuStyle = useSelectMenuStyle(isOpen, triggerRef);

  const openMenu = useCallback(() => {
    setIsOpen(true);
    setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0);
  }, [selectedIndex]);

  const closeMenu = useCallback(() => {
    setIsOpen(false);
  }, []);

  const chooseOption = useCallback((option: string) => {
    setValue(option);
    setValidationError("");
    setIsOpen(false);
    window.requestAnimationFrame(() => triggerRef.current?.focus());
  }, []);

  const moveActive = useCallback(
    (direction: 1 | -1) => {
      setActiveIndex((current) => {
        if (!options.length) return 0;
        return (current + direction + options.length) % options.length;
      });
    },
    [options.length],
  );

  useEffect(() => {
    if (!isOpen) return;

    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        closeMenu();
      }
    };

    document.addEventListener("pointerdown", onPointerDown);

    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [closeMenu, isOpen]);

  useEffect(() => {
    const form = rootRef.current?.closest("form");
    if (!form) return;

    const validateRequiredSelect = () => {
      if (!required || value) return;

      setValidationError("Please select an option.");
    };

    form.addEventListener("submit", validateRequiredSelect, true);

    return () => {
      form.removeEventListener("submit", validateRequiredSelect, true);
    };
  }, [required, value]);

  const onKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (!isOpen && ["ArrowDown", "ArrowUp", "Enter", " "].includes(event.key)) {
      event.preventDefault();
      openMenu();
      return;
    }

    if (!isOpen) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      moveActive(1);
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      moveActive(-1);
      return;
    }

    if (event.key === "Home") {
      event.preventDefault();
      setActiveIndex(0);
      return;
    }

    if (event.key === "End") {
      event.preventDefault();
      setActiveIndex(Math.max(options.length - 1, 0));
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      closeMenu();
      return;
    }

    if (event.key === "Tab") {
      closeMenu();
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      const option = options[activeIndex];
      if (option) chooseOption(option);
      return;
    }

    if (event.key.length === 1 && !event.metaKey && !event.ctrlKey && !event.altKey) {
      const typedKey = event.key.toLowerCase();
      const startIndex = activeIndex + 1;
      const orderedOptions = [...options.slice(startIndex), ...options.slice(0, startIndex)];
      const match = orderedOptions.find((option) => option.toLowerCase().startsWith(typedKey));

      if (match) {
        event.preventDefault();
        setActiveIndex(options.findIndex((option) => option === match));
      }
    }
  };

  return (
    <div className="premium-select" ref={rootRef}>
      <input name={name} type="hidden" value={value} />
      <button
        aria-activedescendant={activeOptionId}
        aria-controls={listboxId}
        aria-describedby={validationError ? errorId : undefined}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-invalid={validationError ? true : undefined}
        aria-label={ariaLabel}
        className={`premium-select-trigger${value ? "" : " is-placeholder"}${isOpen ? " is-open" : ""}`}
        onClick={() => {
          if (isOpen) {
            closeMenu();
          } else {
            openMenu();
          }
        }}
        onKeyDown={onKeyDown}
        ref={triggerRef}
        role="combobox"
        type="button"
      >
        <span>{selectedLabel}</span>
        <svg aria-hidden="true" className="premium-select-icon" fill="none" viewBox="0 0 20 20">
          <path d="m5.5 7.5 4.5 4.5 4.5-4.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" />
        </svg>
      </button>
      {isOpen ? (
        <ul className="premium-select-menu" id={listboxId} role="listbox" style={menuStyle}>
          {options.map((option, index) => (
            <li
              aria-selected={option === value}
              className={`${index === activeIndex ? "is-active" : ""}${option === value ? " is-selected" : ""}`}
              id={`${generatedId}-option-${index}`}
              key={option}
              onMouseDown={(event) => event.preventDefault()}
              onMouseEnter={() => setActiveIndex(index)}
              onClick={() => chooseOption(option)}
              role="option"
            >
              {option}
            </li>
          ))}
        </ul>
      ) : null}
      {validationError ? (
        <p className="premium-select-error" id={errorId}>
          {validationError}
        </p>
      ) : null}
    </div>
  );
}

export function PremiumMultiSelect({ ariaLabel, name, options, placeholder, required = false }: PremiumMultiSelectProps) {
  const generatedId = useId();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValues, setSelectedValues] = useState<string[]>([]);
  const [validationError, setValidationError] = useState("");

  const selectedSet = useMemo(() => new Set(selectedValues), [selectedValues]);
  const listboxId = `${generatedId}-listbox`;
  const errorId = `${generatedId}-error`;
  const activeOptionId = isOpen && activeIndex >= 0 ? `${generatedId}-option-${activeIndex}` : undefined;
  const menuStyle = useSelectMenuStyle(isOpen, triggerRef);

  const openMenu = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeMenu = useCallback(() => {
    setIsOpen(false);
  }, []);

  const toggleOption = useCallback((option: string) => {
    setSelectedValues((current) =>
      current.includes(option) ? current.filter((value) => value !== option) : [...current, option],
    );
    setValidationError("");
  }, []);

  const moveActive = useCallback(
    (direction: 1 | -1) => {
      setActiveIndex((current) => {
        if (!options.length) return 0;
        return (current + direction + options.length) % options.length;
      });
    },
    [options.length],
  );

  useEffect(() => {
    if (!isOpen) return;

    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        closeMenu();
      }
    };

    document.addEventListener("pointerdown", onPointerDown);

    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [closeMenu, isOpen]);

  useEffect(() => {
    const form = rootRef.current?.closest("form");
    if (!form) return;

    const validateRequiredSelect = () => {
      if (!required || selectedValues.length) return;

      setValidationError("Please select at least one option.");
    };

    form.addEventListener("submit", validateRequiredSelect, true);

    return () => {
      form.removeEventListener("submit", validateRequiredSelect, true);
    };
  }, [required, selectedValues.length]);

  const onKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (!isOpen && ["ArrowDown", "ArrowUp", "Enter", " "].includes(event.key)) {
      event.preventDefault();
      openMenu();
      return;
    }

    if (!isOpen) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      moveActive(1);
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      moveActive(-1);
      return;
    }

    if (event.key === "Home") {
      event.preventDefault();
      setActiveIndex(0);
      return;
    }

    if (event.key === "End") {
      event.preventDefault();
      setActiveIndex(Math.max(options.length - 1, 0));
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      closeMenu();
      return;
    }

    if (event.key === "Tab") {
      closeMenu();
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      const option = options[activeIndex];
      if (option) toggleOption(option);
      return;
    }

    if (event.key.length === 1 && !event.metaKey && !event.ctrlKey && !event.altKey) {
      const typedKey = event.key.toLowerCase();
      const startIndex = activeIndex + 1;
      const orderedOptions = [...options.slice(startIndex), ...options.slice(0, startIndex)];
      const match = orderedOptions.find((option) => option.toLowerCase().startsWith(typedKey));

      if (match) {
        event.preventDefault();
        setActiveIndex(options.findIndex((option) => option === match));
      }
    }
  };

  return (
    <div className="premium-select" ref={rootRef}>
      {selectedValues.map((value) => (
        <input key={value} name={name} type="hidden" value={value} />
      ))}
      <button
        aria-activedescendant={activeOptionId}
        aria-controls={listboxId}
        aria-describedby={validationError ? errorId : undefined}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-invalid={validationError ? true : undefined}
        aria-label={ariaLabel}
        className={`premium-select-trigger premium-select-trigger-multi${selectedValues.length ? "" : " is-placeholder"}${isOpen ? " is-open" : ""}`}
        onClick={() => {
          if (isOpen) {
            closeMenu();
          } else {
            openMenu();
          }
        }}
        onKeyDown={onKeyDown}
        ref={triggerRef}
        role="combobox"
        type="button"
      >
        {selectedValues.length ? (
          <span className="premium-select-pills">
            {selectedValues.map((value) => (
              <span className="premium-select-pill" key={value}>
                {value}
              </span>
            ))}
          </span>
        ) : (
          <span>{placeholder}</span>
        )}
        <svg aria-hidden="true" className="premium-select-icon" fill="none" viewBox="0 0 20 20">
          <path d="m5.5 7.5 4.5 4.5 4.5-4.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" />
        </svg>
      </button>
      {isOpen ? (
        <ul aria-multiselectable="true" className="premium-select-menu" id={listboxId} role="listbox" style={menuStyle}>
          {options.map((option, index) => {
            const isSelected = selectedSet.has(option);

            return (
              <li
                aria-selected={isSelected}
                className={`${index === activeIndex ? "is-active" : ""}${isSelected ? " is-selected" : ""}`}
                id={`${generatedId}-option-${index}`}
                key={option}
                onMouseDown={(event) => event.preventDefault()}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => toggleOption(option)}
                role="option"
              >
                <span className="premium-select-check" aria-hidden="true">
                  {isSelected ? "✓" : ""}
                </span>
                <span>{option}</span>
              </li>
            );
          })}
        </ul>
      ) : null}
      {validationError ? (
        <p className="premium-select-error" id={errorId}>
          {validationError}
        </p>
      ) : null}
    </div>
  );
}
