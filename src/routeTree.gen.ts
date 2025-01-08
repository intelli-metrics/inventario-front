/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file was automatically generated by TanStack Router.
// You should NOT make any changes in this file as it will be overwritten.
// Additionally, you should also exclude this file from your linter and/or formatter to prevent it from being checked or modified.

import { createFileRoute } from '@tanstack/react-router'

// Import Routes

import { Route as rootRoute } from './routes/__root'

// Create Virtual Routes

const HistoricoLazyImport = createFileRoute('/historico')()
const GerarLayoutLazyImport = createFileRoute('/gerar-layout')()
const IndexLazyImport = createFileRoute('/')()

// Create/Update Routes

const HistoricoLazyRoute = HistoricoLazyImport.update({
  id: '/historico',
  path: '/historico',
  getParentRoute: () => rootRoute,
} as any).lazy(() => import('./routes/historico.lazy').then((d) => d.Route))

const GerarLayoutLazyRoute = GerarLayoutLazyImport.update({
  id: '/gerar-layout',
  path: '/gerar-layout',
  getParentRoute: () => rootRoute,
} as any).lazy(() => import('./routes/gerar-layout.lazy').then((d) => d.Route))

const IndexLazyRoute = IndexLazyImport.update({
  id: '/',
  path: '/',
  getParentRoute: () => rootRoute,
} as any).lazy(() => import('./routes/index.lazy').then((d) => d.Route))

// Populate the FileRoutesByPath interface

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/': {
      id: '/'
      path: '/'
      fullPath: '/'
      preLoaderRoute: typeof IndexLazyImport
      parentRoute: typeof rootRoute
    }
    '/gerar-layout': {
      id: '/gerar-layout'
      path: '/gerar-layout'
      fullPath: '/gerar-layout'
      preLoaderRoute: typeof GerarLayoutLazyImport
      parentRoute: typeof rootRoute
    }
    '/historico': {
      id: '/historico'
      path: '/historico'
      fullPath: '/historico'
      preLoaderRoute: typeof HistoricoLazyImport
      parentRoute: typeof rootRoute
    }
  }
}

// Create and export the route tree

export interface FileRoutesByFullPath {
  '/': typeof IndexLazyRoute
  '/gerar-layout': typeof GerarLayoutLazyRoute
  '/historico': typeof HistoricoLazyRoute
}

export interface FileRoutesByTo {
  '/': typeof IndexLazyRoute
  '/gerar-layout': typeof GerarLayoutLazyRoute
  '/historico': typeof HistoricoLazyRoute
}

export interface FileRoutesById {
  __root__: typeof rootRoute
  '/': typeof IndexLazyRoute
  '/gerar-layout': typeof GerarLayoutLazyRoute
  '/historico': typeof HistoricoLazyRoute
}

export interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByFullPath
  fullPaths: '/' | '/gerar-layout' | '/historico'
  fileRoutesByTo: FileRoutesByTo
  to: '/' | '/gerar-layout' | '/historico'
  id: '__root__' | '/' | '/gerar-layout' | '/historico'
  fileRoutesById: FileRoutesById
}

export interface RootRouteChildren {
  IndexLazyRoute: typeof IndexLazyRoute
  GerarLayoutLazyRoute: typeof GerarLayoutLazyRoute
  HistoricoLazyRoute: typeof HistoricoLazyRoute
}

const rootRouteChildren: RootRouteChildren = {
  IndexLazyRoute: IndexLazyRoute,
  GerarLayoutLazyRoute: GerarLayoutLazyRoute,
  HistoricoLazyRoute: HistoricoLazyRoute,
}

export const routeTree = rootRoute
  ._addFileChildren(rootRouteChildren)
  ._addFileTypes<FileRouteTypes>()

/* ROUTE_MANIFEST_START
{
  "routes": {
    "__root__": {
      "filePath": "__root.tsx",
      "children": [
        "/",
        "/gerar-layout",
        "/historico"
      ]
    },
    "/": {
      "filePath": "index.lazy.tsx"
    },
    "/gerar-layout": {
      "filePath": "gerar-layout.lazy.tsx"
    },
    "/historico": {
      "filePath": "historico.lazy.tsx"
    }
  }
}
ROUTE_MANIFEST_END */