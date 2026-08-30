import { useEffect, useRef, useState } from "react";

const DEFAULT_EXPLORER_WIDTH = 280;
const MIN_EXPLORER_WIDTH = 180;
const MAX_EXPLORER_WIDTH = 500;

const DEFAULT_SIDEBAR_WIDTH = 300;
const MIN_SIDEBAR_WIDTH = 280;
const MAX_SIDEBAR_WIDTH = 480;

const DEFAULT_OUTPUT_HEIGHT = 224;
const MIN_OUTPUT_HEIGHT = 160;
const MAX_OUTPUT_HEIGHT = 500;


export function useWorkspaceLayout() {
  const explorerDragging = useRef(false);

  const [explorerWidth, setExplorerWidth] = useState(() => {
    const saved = localStorage.getItem("explorer-width");

    return saved ? Number(saved) : DEFAULT_EXPLORER_WIDTH;
  });

  const [explorerOpen, setExplorerOpen] = useState(() => {
    return localStorage.getItem("explorer-open") !== "false";
  });



  const sidebarDragging = useRef(false);

  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const saved = localStorage.getItem("sidebar-width");

    return saved
      ? Number(saved)
      : DEFAULT_SIDEBAR_WIDTH;
  });

  const [sidebarOpen, setSidebarOpen] = useState(() => {
    return localStorage.getItem("sidebar-open") !== "false";
  });



  const outputDragging = useRef(false);

  const [outputHeight, setOutputHeight] = useState(() => {
    const saved = localStorage.getItem("output-height");
    return saved ? Number(saved) : DEFAULT_OUTPUT_HEIGHT;
  });

  const [outputOpen, setOutputOpen] = useState(() => {
    return localStorage.getItem("output-open") === "true";
  });




  function startExplorerResize() {
    explorerDragging.current = true;
  }

  function resetExplorerWidth() {
    setExplorerWidth(DEFAULT_EXPLORER_WIDTH);
  }

  function toggleExplorer() {
    setExplorerOpen((prev) => !prev);
  }



  function startSidebarResize() {
    sidebarDragging.current = true;
  }

  function resetSidebarWidth() {
    setSidebarWidth(DEFAULT_SIDEBAR_WIDTH);
  }

  function toggleSidebar() {
    setSidebarOpen((prev) => !prev);
  }



  function startOutputResize() {
    outputDragging.current = true;
  }

  function resetOutputHeight() {
    setOutputHeight(DEFAULT_OUTPUT_HEIGHT);
  }

  function openOutput() {
    setOutputOpen(true);
  }

  function closeOutput() {
    setOutputOpen(false);
  }

  function toggleOutput() {
    setOutputOpen((prev) => !prev);
  }



  useEffect(() => {
    function handleMouseMove(e: MouseEvent) {
      if (explorerDragging.current) {
        const width = Math.max(
          MIN_EXPLORER_WIDTH,
          Math.min(MAX_EXPLORER_WIDTH, e.clientX)
        );
      
        setExplorerWidth(width);
      }
    
      if (sidebarDragging.current) {
        const windowWidth = window.innerWidth;
      
        const width = Math.max(
          MIN_SIDEBAR_WIDTH,
          Math.min(
            MAX_SIDEBAR_WIDTH,
            windowWidth - e.clientX
          )
        );
      
        setSidebarWidth(width);
      }

      if (outputDragging.current) {
        const newHeight = Math.max(
          MIN_OUTPUT_HEIGHT,
          Math.min(
            MAX_OUTPUT_HEIGHT,
            window.innerHeight - e.clientY
          )
        );
      
        setOutputHeight(newHeight);
      }
    }

    function handleMouseUp() {
      explorerDragging.current = false;
      sidebarDragging.current = false;
      outputDragging.current = false;
    }

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "explorer-width",
      explorerWidth.toString()
    );
  }, [explorerWidth]);

  useEffect(() => {
    localStorage.setItem(
      "explorer-open",
      explorerOpen.toString()
    );
  }, [explorerOpen]);


  useEffect(() => {
    localStorage.setItem(
      "sidebar-width",
      sidebarWidth.toString()
    );
  }, [sidebarWidth]);

  useEffect(() => {
    localStorage.setItem(
      "sidebar-open",
      sidebarOpen.toString()
    );
  }, [sidebarOpen]);


  useEffect(() => {
    localStorage.setItem(
      "output-height",
      outputHeight.toString()
    );
  }, [outputHeight]);

  useEffect(() => {
    localStorage.setItem(
      "output-open",
      outputOpen.toString()
    );
  }, [outputOpen]);


  return {
    explorer: {
      width: explorerWidth,
      isOpen: explorerOpen,
      toggle: toggleExplorer,
      reset: resetExplorerWidth,
      startResize: startExplorerResize,
      dragging: explorerDragging,
    },

    sidebar: {
      width: sidebarWidth,
      isOpen: sidebarOpen,
      toggle: toggleSidebar,
      reset: resetSidebarWidth,
      startResize: startSidebarResize,
      dragging: sidebarDragging,
    },

    output: {
      height: outputHeight,
      isOpen: outputOpen,
      open: openOutput,
      close: closeOutput,
      toggle: toggleOutput,
      reset: resetOutputHeight,
      startResize: startOutputResize,
      dragging: outputDragging,
    }
  };
}