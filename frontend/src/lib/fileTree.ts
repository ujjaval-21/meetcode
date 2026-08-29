import type { RoomFile } from "../services/room";

export interface FileNode {
  id: string;
  name: string;
  type: "file" | "folder";
  content?: string;
  children?: FileNode[];
}


export function findFileById(
  nodes: FileNode[],
  id: string
): FileNode | null {

  for (const node of nodes) {

    if (node.id === id) {
      return node;
    }

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


export function buildTree(
  flatFiles: RoomFile[]
): FileNode[] {

  const map = new Map<string, FileNode>();

  flatFiles.forEach((file) => {
    map.set(file.id, {
      id: file.id,
      name: file.name,
      type: file.type,
      content: file.content ?? "",
      children:
        file.type === "folder"
          ? []
          : undefined,
    });
  });

  const roots: FileNode[] = [];

  flatFiles.forEach((file) => {

    const node = map.get(file.id)!;

    if (
      file.parent_id &&
      map.has(file.parent_id)
    ) {

      map
        .get(file.parent_id)!
        .children!
        .push(node);

    } else {

      roots.push(node);

    }
  });

  return roots;
}


export function addExistingFile(
  nodes: FileNode[],
  parentId: string,
  file: FileNode
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
          file,
        ],
      };
    }

    if (node.children) {
      return {
        ...node,
        children: addExistingFile(
          node.children,
          parentId,
          file
        ),
      };
    }

    return node;
  });

}


export function renameTree(
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


export function deleteTree(
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


export function updateFileContent(
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


