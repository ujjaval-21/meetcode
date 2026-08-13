import { useEffect } from "react";
import {
  createContext,
  useContext,
  useState,
} from "react";

import type {
  Dispatch,
  ReactNode,
  SetStateAction,
} from "react";

export interface FileNode {
  id: string;
  name: string;
  type: "file" | "folder";

  content?: string;

  children?: FileNode[];
}

interface FileContextType {
  openedFiles: FileNode[];
  openFile: (file: FileNode) => void;
  closeFile: (id: string) => void;
  createFile: (parentId: string) => void;
  createFolder: (parentId: string) => void;
  renameNode: (id: string, name: string) => void;
  deleteNode: (id: string) => void;
  files: FileNode[];
  activeFileId: string | null;
  activeFile: FileNode | null;
  setFiles: Dispatch<
    SetStateAction<FileNode[]>
  >;

  editingNodeId: string | null;

  setEditingNodeId: Dispatch<
    SetStateAction<string | null>
  >;

  setActiveFileContent: (
    content: string
  ) => void;

  setActiveFileId: Dispatch<
    SetStateAction<string | null>
  >;
}

const FileContext =
  createContext<FileContextType | undefined>(
    undefined
  );

export function FileProvider({
  children,
}: {
  children: ReactNode;
}) {

  const [files, setFiles] = useState<FileNode[]>([
    {
      id: "1",
      name: "src",
      type: "folder",
      children: [
        {
          id: "2",
          name: "main.py",
          type: "file",
          content: 'print("Hello MeetCode")',
        },
        {
          id: "3",
          name: "utils.py",
          type: "file",
          content: "",
        },
      ],
    },
    {
      id: "4",
      name: "README.md",
      type: "file",
      content: "# MeetCode",
    },
  ]);

  const [activeFileId, setActiveFileId] =
    useState<string | null>("2");

  const [openedFiles, setOpenedFiles] =
    useState<FileNode[]>([]);

  const [
    editingNodeId,
    setEditingNodeId,
  ] = useState<string | null>(null);

  
  function generateId() {
    return crypto.randomUUID();
  }


  function findFileById(
    nodes: FileNode[],
    id: string
  ): FileNode | null {

    for (const node of nodes) {

      if (node.id === id)
        return node;

      if (node.children) {

        const result = findFileById(
          node.children,
          id
        );

        if (result) {
          return result;
        }
      }
    }

    return null;
  }


  function openFile(file: FileNode) {
    setOpenedFiles((prev) => {

      const exists = prev.some(
        (f) => f.id === file.id
      );
      if (exists) {
        return prev;
      }
      return [...prev, file];
    });

    setActiveFileId(file.id);
  }


  function closeFile(id: string) {
    setOpenedFiles((prev) => {

      const index =
        prev.findIndex((f) => f.id === id);

      const updated =
        prev.filter((f) => f.id !== id);

      if (activeFileId === id) {
        if (updated.length === 0) {
          setActiveFileId(null);
        } else {
          const next =
            updated[
              Math.max(index - 1, 0)
            ];
          setActiveFileId(next.id);
        }
      }
      return updated;
    });
  }


  function updateFileContent(
    nodes: FileNode[],
    id: string,
    content: string
  ): FileNode[] {
    return nodes.map((node) => {

      if (node.id === id) {
        return {
          ...node,
          content,
        };
      }

      if (node.children) {
        return {
          ...node,
          children: updateFileContent(
            node.children,
            id,
            content
          ),
        };
      }
      return node;
    });
  }


  function addFile(
    nodes: FileNode[],
    parentId: string,
    id: string
  ): FileNode[] {
    return nodes.map((node) => {
      if (
        node.id === parentId &&
        node.type === "folder"
      ) {
        return {
          ...node,
          children: [
            ...(node.children ?? []),
            {
              id,
              name: "new_file.py",
              type: "file",
              content: "",
            },
          ],
        };
      }

      if (node.children) {
        return {
          ...node,
          children: addFile(
            node.children,
            parentId,
            id
          ),
        };
      }

      return node;
    });
  }


  function addFolder(
    nodes: FileNode[],
    parentId: string,
    id: string
  ): FileNode[] {
    return nodes.map((node) => {
      if (
        node.id === parentId &&
        node.type === "folder"
      ) {
        return {
          ...node,
          children: [
            ...(node.children ?? []),
            {
              id,
              name: "New Folder",
              type: "folder",
              children: [],
            },
          ],
        };
      }

      if (node.children) {
        return {
          ...node,
          children: addFolder(
            node.children,
            parentId,
            id
          ),
        };
      }

      return node;
    });
  }


  function renameTree(
    nodes: FileNode[],
    id: string,
    name: string
  ): FileNode[] {
    return nodes.map((node) => {
      if (node.id === id) {
        return {
          ...node,
          name,
        };
      }

      if (node.children) {
        return {
          ...node,
          children: renameTree(
            node.children,
            id,
            name
          ),
        };
      }

      return node;
    });
  }


  function deleteTree(
    nodes: FileNode[],
    id: string
  ): FileNode[] {
    return nodes
      .filter((node) => node.id !== id)
      .map((node) => ({
        ...node,
        children: node.children
          ? deleteTree(
              node.children,
              id
            )
          : undefined,
      }));
  }



  const activeFile = activeFileId
    ? findFileById(files, activeFileId)
    : null;


  function setActiveFileContent(
    content: string
  ) {
    if (!activeFileId) return;

    setFiles((prev) =>
      updateFileContent(
        prev,
        activeFileId,
        content
      )
    );
  }


  function createFile(parentId: string) {
    const id = generateId();

    setFiles((prev) =>
      addFile(prev, parentId, id)
    );

    setEditingNodeId(id);
  }


  function createFolder(parentId: string) {
    const id = generateId();

    setFiles((prev) =>
      addFolder(prev, parentId, id)
    );

    setEditingNodeId(id);
  }

  function renameNode(id: string, name: string) {
    setFiles((prev) =>
      renameTree(prev, id, name)
    );
  }

  function deleteNode(id: string) {
    setFiles((prev) =>
      deleteTree(prev, id)
    );

    setOpenedFiles((prev) =>
      prev.filter((f) => f.id !== id)
    );

    if (activeFileId === id) {
      setActiveFileId(null);
    }
  }




  useEffect(() => {
    if (
      activeFile &&
      openedFiles.length === 0
    ) {

      setOpenedFiles([activeFile]);

    }
  }, []);


  return (
    <FileContext.Provider
      value={{
        files,
        openedFiles,
        openFile,
        closeFile,
        activeFile,
        activeFileId,
        setActiveFileContent,
        setFiles,
        setActiveFileId,
        createFile,
        createFolder,
        renameNode,
        deleteNode,
        editingNodeId,
        setEditingNodeId,
      }}
    >
      {children}
    </FileContext.Provider>
  );
}


export function useFiles() {

  const context =
    useContext(FileContext);

  if (!context) {
    throw new Error(
      "useFiles must be used inside FileProvider"
    );
  }

  return context;
}