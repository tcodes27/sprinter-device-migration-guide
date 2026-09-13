import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";

const THRESHOLD = 0.3;

function getScrollProgress() {
  const el = document.documentElement;
  const scrollable = el.scrollHeight - el.clientHeight;
  if (scrollable <= 0) return 0;
  return el.scrollTop / scrollable;
}

export function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        setVisible(getScrollProgress() > THRESHOLD);
        ticking = false;
      });
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = () => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.2 }}
          className="fixed bottom-24 right-3 z-40 sm:bottom-24 sm:right-4"
        >
          <Button
            type="button"
            size="icon"
            onClick={scrollToTop}
            aria-label="Back to top"
            className="h-12 w-12 rounded-full bg-primary text-primary-foreground shadow-float hover:bg-primary/90 focus-visible:ring-4 focus-visible:ring-ring/40"
          >
            <ArrowUp aria-hidden />
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
