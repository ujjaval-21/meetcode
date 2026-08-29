import { roomSocket } from "../services/websocket";
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
import { getRoomFiles } from "../services/room";
import { useParams } from "react-router-dom";

import {
  buildTree,
  findFileById,
  addExistingFile,
  renameTree,
  deleteTree,
  updateFileContent,
} from "../lib/fileTree";

import type {
  FileNode,
} from "../lib/fileTree";



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

  createFileRemote: (
    parentId: string,
    file: FileNode
  ) => void;

  createFolderRemote: (
    parentId: string,
    folder: FileNode
  ) => void;

  renameNodeRemote: (
    id: string,
    name: string
  ) => void;

  deleteNodeRemote: (
    id: string
  ) => void;

  openFileRemote: (fileId: string) => void;

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
  const { roomCode } = useParams();
  const [files, setFiles] = useState<FileNode[]>([]);
  const [activeFileId, setActiveFileId] = useState<string | null>(null);
  const [openedFiles, setOpenedFiles] = useState<FileNode[]>([]);
  const [editingNodeId,setEditingNodeId ] = useState<string | null>(null);
  const [pendingOpenFileId, setPendingOpenFileId] = useState<string | null>(null);



  function openFile(
    file: FileNode,
    broadcast = true
  ) {
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

    if (broadcast) {
      roomSocket.send({
        type: "file_open",
        fileId: file.id,
      });
    }
  }


  function openFileRemote(fileId: string) {
    const file = findFileById(files, fileId);

    if (!file) {
        setPendingOpenFileId(fileId);
        return;
    }

    openFile(file, false);
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


  function createFileRemote(
    parentId: string,
    file: FileNode
  ) {
    setFiles((prev) =>
      addExistingFile(prev, parentId, file)
    );
  }


  function createFolderRemote(
    parentId: string,
    folder: FileNode
  ) {
    setFiles((prev) =>
      addExistingFile(
        prev,
        parentId,
        folder
      )
    );
  }


  function renameNodeRemote(
    id: string,
    name: string
  ) {
    setFiles((prev) =>
      renameTree(prev, id, name)
    );
    setOpenedFiles(prev =>
      prev.map(file =>
        file.id === id
          ? {
              ...file,
              name,
            }
          : file
      )
    );
  }


  function deleteNodeRemote(
    id: string
  ) {

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

    roomSocket.send({
        type: "file_create",
        parentId,
        node: {
            name: "new_file.py",
            type: "file",
            content: "",
        },
    });
  }


  function createFolder(parentId: string) {

    roomSocket.send({
        type: "file_create",
        parentId,
        node: {
            name: "New Folder",
            type: "folder",
            children: [],
        },
    });
  }

  
  function renameNode(
    id: string,
    name: string
  ) {

    renameNodeRemote(id, name);

    roomSocket.send({
      type: "file_rename",
      id,
      name,
    });

  }

  function deleteNode(id: string) {
    deleteNodeRemote(id);

    roomSocket.send({
      type: "file_delete",
      id,
    });
  }

  
  useEffect(() => {
    console.log("roomCode =", roomCode);

    if (!roomCode) {
      console.log("No roomCode");
      return;
    }

    const currentRoomCode = roomCode;

    async function loadFiles() {
      console.log("Calling getRoomFiles...");

      try {
        const roomFiles = await getRoomFiles(currentRoomCode);

        console.log("API returned:", roomFiles);

        setFiles(buildTree(roomFiles));
      } catch (err) {
        console.error("Failed to load room files", err);
      }
    }

    loadFiles();
  }, [roomCode]);


  
  useEffect(() => {
    if (
      activeFile &&
      openedFiles.length === 0
    ) {

      setOpenedFiles([activeFile]);

    }
  }, []);


  useEffect(() => {
    const listener = (message: any) => {
      switch (message.type) {
        case "file_create":
          if (message.node.type === "file") {
              createFileRemote(
                  message.parentId,
                  message.node
              );            
              // Automatically open the new file
              openFileRemote(message.node.id);            
          } else {          
              createFolderRemote(
                  message.parentId,
                  message.node
              );            
          }        
          break;

        case "file_rename":
          renameNodeRemote(
              message.id,
              message.name
          );
          break;

        case "file_delete":
          deleteNodeRemote(message.id);
          break;

        case "file_open":
          openFileRemote(message.fileId);
          break;
      }
    };

    roomSocket.addListener(listener);

    return () => {
        roomSocket.removeListener(listener);
    };

  }, []);


  useEffect(() => {
    if (!pendingOpenFileId) return;

    const file = findFileById(files, pendingOpenFileId);

    if (!file) return;

    openFile(file, false);
    setPendingOpenFileId(null);

  }, [files, pendingOpenFileId]);



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
        createFileRemote,
        createFolderRemote,
        renameNodeRemote,
        deleteNodeRemote,
        openFileRemote,
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