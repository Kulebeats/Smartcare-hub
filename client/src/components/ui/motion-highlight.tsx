'use client';

import * as React from 'react';
import { motion, AnimatePresence, type Transition, type HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

type MotionHighlightMode = 'children' | 'parent';

type Bounds = {
  top: number;
  left: number;
  width: number;
  height: number;
};

type MotionHighlightContextType<T extends string> = {
  mode: MotionHighlightMode;
  activeValue: T | null;
  setActiveValue: (value: T | null) => void;
  setBounds: (bounds: DOMRect) => void;
  clearBounds: () => void;
  id: string;
  hover: boolean;
  className?: string;
  activeClassName?: string;
  setActiveClassName: (className: string) => void;
  transition?: Transition;
  disabled?: boolean;
  enabled?: boolean;
  exitDelay?: number;
  forceUpdateBounds?: boolean;
};

const MotionHighlightContext = React.createContext<
  MotionHighlightContextType<any> | undefined
>(undefined);

function useMotionHighlight<T extends string>(): MotionHighlightContextType<T> {
  const context = React.useContext(MotionHighlightContext);
  if (!context) {
    throw new Error(
      'useMotionHighlight must be used within a MotionHighlightProvider',
    );
  }
  return context as unknown as MotionHighlightContextType<T>;
}

type BaseMotionHighlightProps<T extends string> = {
  mode?: MotionHighlightMode;
  value?: T | null;
  defaultValue?: T | null;
  onValueChange?: (value: T | null) => void;
  className?: string;
  transition?: Transition;
  hover?: boolean;
  disabled?: boolean;
  enabled?: boolean;
  exitDelay?: number;
};

type ParentModeMotionHighlightProps = {
  boundsOffset?: Partial<Bounds>;
  containerClassName?: string;
  forceUpdateBounds?: boolean;
};

type ControlledParentModeMotionHighlightProps<T extends string> =
  BaseMotionHighlightProps<T> &
    ParentModeMotionHighlightProps & {
      mode: 'parent';
      controlledItems: true;
      children: React.ReactNode;
    };

type ControlledChildrenModeMotionHighlightProps<T extends string> =
  BaseMotionHighlightProps<T> & {
    mode?: 'children' | undefined;
    controlledItems: true;
    children: React.ReactNode;
  };

type UncontrolledParentModeMotionHighlightProps<T extends string> =
  BaseMotionHighlightProps<T> &
    ParentModeMotionHighlightProps & {
      mode: 'parent';
      controlledItems?: false;
      itemsClassName?: string;
      children: React.ReactElement | React.ReactElement[];
    };

type UncontrolledChildrenModeMotionHighlightProps<T extends string> =
  BaseMotionHighlightProps<T> & {
    mode?: 'children';
    controlledItems?: false;
    itemsClassName?: string;
    children: React.ReactElement | React.ReactElement[];
  };

type MotionHighlightProps<T extends string> = React.ComponentProps<'div'> &
  (
    | ControlledParentModeMotionHighlightProps<T>
    | ControlledChildrenModeMotionHighlightProps<T>
    | UncontrolledParentModeMotionHighlightProps<T>
    | UncontrolledChildrenModeMotionHighlightProps<T>
  );

const MotionHighlight = React.forwardRef(<T extends string>(
  props: MotionHighlightProps<T>,
  ref: React.Ref<HTMLDivElement>
) => {
  const {
    children,
    value,
    defaultValue,
    onValueChange,
    className,
    transition = { type: 'spring', stiffness: 350, damping: 35 },
    hover = false,
    enabled = true,
    controlledItems,
    disabled = false,
    exitDelay = 0.2,
    mode = 'children',
  } = props;

  const localRef = React.useRef<HTMLDivElement>(null);
  React.useImperativeHandle(ref, () => localRef.current as HTMLDivElement);

  const [activeValue, setActiveValueState] = React.useState<T | null>(
    value ?? defaultValue ?? null,
  );
  const [boundsState, setBoundsState] = React.useState<Bounds | null>(null);
  const [activeClassNameState, setActiveClassNameState] =
    React.useState<string>('');

  const safeSetActiveValue = React.useCallback(
    (id: T | null) => {
      setActiveValueState((prev) => (prev === id ? prev : id));
      if (id !== activeValue) onValueChange?.(id as T);
    },
    [activeValue, onValueChange],
  );

  const safeSetBounds = React.useCallback(
    (bounds: DOMRect) => {
      if (!localRef.current) return;
      const boundsOffset = (props as ParentModeMotionHighlightProps)
        ?.boundsOffset ?? {
        top: 0,
        left: 0,
        width: 0,
        height: 0,
      };
      const containerRect = localRef.current.getBoundingClientRect();
      const newBounds: Bounds = {
        top: bounds.top - containerRect.top + (boundsOffset.top ?? 0),
        left: bounds.left - containerRect.left + (boundsOffset.left ?? 0),
        width: bounds.width + (boundsOffset.width ?? 0),
        height: bounds.height + (boundsOffset.height ?? 0),
      };
      setBoundsState((prev) => {
        if (
          prev &&
          prev.top === newBounds.top &&
          prev.left === newBounds.left &&
          prev.width === newBounds.width &&
          prev.height === newBounds.height
        ) {
          return prev;
        }
        return newBounds;
      });
    },
    [props], 
  );

  const clearBounds = React.useCallback(() => {
    setBoundsState((prev) => (prev === null ? prev : null));
  }, []);

  React.useEffect(() => {
    if (value !== undefined) setActiveValueState(value);
    else if (defaultValue !== undefined) setActiveValueState(defaultValue);
  }, [value, defaultValue]);

  const id = React.useId();

  React.useEffect(() => {
    if (mode !== 'parent') return;
    const container = localRef.current;
    if (!container) return;
    const onScroll = () => {
      if (!activeValue) return;
      const activeEl = container.querySelector<HTMLElement>(
        `[data-value="${activeValue}"][data-highlight="true"]`,
      );
      if (activeEl) safeSetBounds(activeEl.getBoundingClientRect());
    };
    container.addEventListener('scroll', onScroll, { passive: true });
    return () => container.removeEventListener('scroll', onScroll);
  }, [mode, activeValue, safeSetBounds]);

  const render = React.useCallback(
    (childrenToRender: React.ReactNode) => {
      if (mode === 'parent') {
        return (
          <div
            ref={localRef}
            data-slot="motion-highlight-container"
            className={cn(
              'relative',
              (props as ParentModeMotionHighlightProps)?.containerClassName,
            )}
          >
            <AnimatePresence initial={false}>
              {boundsState && (
                <motion.div
                  data-slot="motion-highlight"
                  animate={{
                    top: boundsState.top,
                    left: boundsState.left,
                    width: boundsState.width,
                    height: boundsState.height,
                    opacity: 1,
                  }}
                  initial={{
                    top: boundsState.top,
                    left: boundsState.left,
                    width: boundsState.width,
                    height: boundsState.height,
                    opacity: 0,
                  }}
                  exit={{
                    opacity: 0,
                    transition: {
                      ...transition,
                      delay: (transition?.delay ?? 0) + (exitDelay ?? 0),
                    },
                  }}
                  transition={transition}
                  className={cn(
                    'absolute bg-blue-100 rounded-lg z-0',
                    className,
                    activeClassNameState,
                  )}
                />
              )}
            </AnimatePresence>
            {childrenToRender}
          </div>
        );
      }
      return childrenToRender;
    },
    [
      mode,
      props,
      boundsState,
      transition,
      exitDelay,
      className,
      activeClassNameState,
    ],
  );

  return (
    <MotionHighlightContext.Provider
      value={{
        mode,
        activeValue: activeValue,
        setActiveValue: safeSetActiveValue,
        id,
        hover,
        className,
        transition,
        disabled,
        enabled,
        exitDelay,
        setBounds: safeSetBounds,
        clearBounds,
        activeClassName: activeClassNameState,
        setActiveClassName: setActiveClassNameState,
        forceUpdateBounds: (props as ParentModeMotionHighlightProps)
          ?.forceUpdateBounds,
      }}
    >
      {enabled
        ? controlledItems
          ? render(children)
          : render(
              React.Children.map(children, (child) => {
                if (!React.isValidElement(child)) return child;
                const childDataValue = (child.props as any)['data-value'];
                return (
                  <MotionHighlightItem
                    key={childDataValue || child.key}
                    value={childDataValue}
                    className={(props as UncontrolledChildrenModeMotionHighlightProps<T> | UncontrolledParentModeMotionHighlightProps<T>)?.itemsClassName}
                  >
                    {child}
                  </MotionHighlightItem>
                );
              }),
            )
        : children}
    </MotionHighlightContext.Provider>
  );
}) as <T extends string>(props: MotionHighlightProps<T> & { ref?: React.Ref<HTMLDivElement> }) => React.ReactElement;
(MotionHighlight as any).displayName = 'MotionHighlight';

type ExtendedChildProps = React.ComponentProps<'div'> & {
  id?: string;
  ref?: React.Ref<HTMLElement>;
  'data-active'?: string;
  'data-value'?: string;
  'data-disabled'?: boolean;
  'data-highlight'?: boolean;
  'data-slot'?: string;
};

type MotionHighlightItemProps = React.ComponentProps<'div'> & {
  children: React.ReactElement;
  id?: string;
  value?: string;
  className?: string;
  transition?: Transition;
  activeClassName?: string;
  disabled?: boolean;
  exitDelay?: number;
  asChild?: boolean;
  forceUpdateBounds?: boolean;
};

const MotionHighlightItem = React.forwardRef<HTMLDivElement, MotionHighlightItemProps>(({
  children,
  id,
  value,
  className,
  transition,
  disabled = false,
  activeClassName,
  exitDelay,
  asChild = false,
  forceUpdateBounds,
  ...props
}, ref) => {
  const itemId = React.useId();
  const {
    activeValue,
    setActiveValue,
    mode,
    setBounds,
    clearBounds,
    hover,
    enabled,
    className: contextClassName,
    transition: contextTransition,
    id: contextId,
    disabled: contextDisabled,
    exitDelay: contextExitDelay,
    forceUpdateBounds: contextForceUpdateBounds,
    setActiveClassName,
  } = useMotionHighlight();

  const element = children as React.ReactElement<ExtendedChildProps>;
  const childValue =
    id ?? value ?? element.props?.['data-value'] ?? element.props?.id ?? itemId;
  const isActive = activeValue === childValue;
  const isDisabled = disabled === undefined ? contextDisabled : disabled;
  const itemTransition = transition ?? contextTransition;

  const localRef = React.useRef<HTMLDivElement>(null);
  React.useImperativeHandle(ref, () => localRef.current as HTMLDivElement);

  React.useEffect(() => {
    if (mode !== 'parent') return;
    if (!isActive || !localRef.current) return;
    
    const updateBounds = () => {
      if (localRef.current) {
        setBounds(localRef.current.getBoundingClientRect());
      }
    };

    updateBounds();
    
    const resizeObserver = new ResizeObserver(updateBounds);
    resizeObserver.observe(localRef.current);
    
    return () => {
      resizeObserver.disconnect();
    };
  }, [isActive, mode, setBounds]);

  const handleClick = React.useCallback((event: React.MouseEvent) => {
    if (isDisabled || !enabled) return;
    setActiveValue(childValue);
    element.props?.onClick?.(event);
  }, [isDisabled, enabled, setActiveValue, childValue, element.props]);

  const childProps: ExtendedChildProps = {
    ...element.props,
    ref: localRef,
    'data-value': childValue,
    'data-active': isActive,
    'data-highlight': 'true',
    'data-disabled': isDisabled,
    onClick: handleClick,
    className: cn(
      element.props.className,
      className,
      isActive ? activeClassName : undefined,
    ),
  };

  return React.cloneElement(element, childProps);
});

MotionHighlightItem.displayName = 'MotionHighlightItem';

export { MotionHighlight, MotionHighlightItem, useMotionHighlight };
export type { MotionHighlightProps, MotionHighlightItemProps };