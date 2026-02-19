# API Usage Documentation

## Overview

This document provides comprehensive documentation for all GraphQL APIs used in the DOPAMS (Drug Offenders Profiling, Analysis and Monitoring System) application. The application uses GraphQL exclusively for all backend communication, with queries for data fetching and mutations for data modifications.

**Base Endpoint:** `/graphql`

**Authentication:** Most queries require authentication via JWT token (except `login` and `signup` mutations).

---

## Table of Contents

1. [Project Overview & Architecture](#project-overview--architecture)
2. [Frontend Architecture & Technology Stack](#frontend-architecture--technology-stack)
3. [API Integration Patterns](#api-integration-patterns)
4. [Detailed Frontend API Usage by Page/Module](#detailed-frontend-api-usage-by-pagemodule)
5. [Data Flow & State Management](#data-flow--state-management)
6. [Error Handling & Loading States](#error-handling--loading-states)
7. [API Reference](#api-reference)
   - [Home & Dashboard APIs](#home--dashboard-apis)
   - [FIR (First Information Report) APIs](#fir-first-information-report-apis)
   - [Accused & Arrest APIs](#accused--arrest-apis)
   - [Criminal Profile APIs](#criminal-profile-apis)
   - [Advanced Search APIs](#advanced-search-apis)
   - [Seizures APIs](#seizures-apis)
   - [User Management APIs](#user-management-apis)
   - [File Upload APIs](#file-upload-apis)
   - [Criminal Network APIs](#criminal-network-apis)

---

## Project Overview & Architecture

### What is DOPAMS?

DOPAMS (Drug Offenders Profiling, Analysis and Monitoring System) is a comprehensive law enforcement management system designed for tracking, analyzing, and monitoring drug-related offenses. The system serves as a centralized platform for law enforcement agencies to manage, analyze, and report on drug-related criminal activities.

#### Core Functionality

The system provides six primary functional areas:

**1. Case Management**
Complete tracking of FIRs (First Information Reports), arrests, and case proceedings. This module allows officers to register new cases, track case status through various stages (under investigation, chargesheeted, pending trial, disposed, etc.), and maintain comprehensive case documentation. Each FIR can be associated with multiple accused persons, property details, drug seizures, chargesheets, and disposal information. The system maintains a complete audit trail of case progression and allows for detailed case history tracking.

**2. Criminal Profiling**
Detailed profiles of accused persons with advanced deduplication and case history tracking. The system employs sophisticated matching algorithms to identify duplicate person records across different cases, ensuring that a single person's complete criminal history is accessible even when they appear in multiple FIRs with slight variations in name, address, or other identifying information. Each profile includes personal information, physical descriptions, addresses (both present and permanent), contact details, and a complete list of associated crimes.

**3. Analytics & Reporting**
Statistical analysis, charts, and visualizations for crime data. The system provides comprehensive analytics capabilities including temporal analysis (trends over time), geographical analysis (crime distribution by unit, district, police station), demographic analysis (age groups, gender, nationality, domicile classifications), and case status analysis. Reports can be generated for specific date ranges, filtered by various criteria, and exported in multiple formats (PDF, Excel).

**4. Advanced Search**
Multi-vertical search capabilities across FIRs, accused, and related entities. This powerful search tool allows users to construct complex queries using multiple criteria, operators (equals, contains, greater than, between, etc.), and logical connectors (AND/OR). Users can search across multiple entity types simultaneously and customize which fields to display in results. The search supports autocomplete for field values, making it easy to find specific records.

**5. Network Analysis**
Criminal network visualization showing relationships between persons and crimes. This feature helps identify criminal networks by visualizing how different accused persons are connected through shared crimes. The network graph shows person-to-crime relationships and can reveal patterns of criminal associations that might not be apparent in tabular data. This is particularly useful for identifying organized crime networks and repeat offenders.

**6. Document Management**
File uploads and document tracking for cases and profiles. The system allows officers to attach documents, photographs, and other files to both FIRs and criminal profiles. Documents are organized and accessible through the detail pages, and the system maintains a complete document history. This ensures that all case-related documentation is centralized and easily accessible.

#### System Purpose and Benefits

DOPAMS addresses several critical needs in modern law enforcement:

- **Data Centralization**: All drug-related case information is stored in a single, searchable database, eliminating the need to search through multiple physical files or disparate systems.

- **Efficiency**: Automated workflows and intelligent search capabilities significantly reduce the time required to find information, generate reports, and track case progress.

- **Data Quality**: Deduplication algorithms ensure that person records are accurate and complete, reducing errors caused by duplicate or inconsistent data entry.

- **Analytics**: Advanced analytics capabilities enable data-driven decision making, helping identify trends, patterns, and areas requiring increased attention.

- **Compliance**: The system helps ensure compliance with reporting requirements and maintains comprehensive audit trails for accountability.

- **Collaboration**: Multiple users can access and update case information simultaneously, facilitating collaboration across different units and departments.

### System Architecture

The application follows a **modern client-server architecture** with clear separation of concerns, enabling scalability, maintainability, and optimal performance. The architecture is designed to support concurrent users, handle large datasets efficiently, and provide a responsive user experience.

#### High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                                    │
│                    (React + TypeScript Frontend)                        │
│                                                                         │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐            │
│  │   Routes     │───▶│  Components  │───▶│   Apollo     │            │
│  │   (Pages)    │    │   (UI)       │    │   Client     │            │
│  │              │    │              │    │              │            │
│  │ - Home       │    │ - Tables     │    │ - Cache      │            │
│  │ - FIRs       │    │ - Forms      │    │ - Queries    │            │
│  │ - Arrests    │    │ - Charts     │    │ - Mutations  │            │
│  │ - Profiles   │    │ - Filters    │    │ - Auth       │            │
│  │ - Search     │    │ - Dialogs    │    │              │            │
│  └──────────────┘    └──────────────┘    └──────────────┘            │
│         │                    │                    │                    │
│         └────────────────────┴────────────────────┘                    │
│                              │                                         │
│                              │ HTTP/HTTPS                              │
│                              │ GraphQL Protocol                        │
│                              │ JWT Authentication                      │
└──────────────────────────────┼─────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         API LAYER                                       │
│                    (Node.js + GraphQL Backend)                         │
│                                                                         │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐            │
│  │   GraphQL    │───▶│   Resolvers  │───▶│   Services   │            │
│  │   Schema     │    │              │    │              │            │
│  │              │    │ - Query      │    │ - Business   │            │
│  │ - Types      │    │   Resolvers  │    │   Logic      │            │
│  │ - Queries    │    │ - Mutation   │    │ - Data       │            │
│  │ - Mutations  │    │   Resolvers  │    │   Transform  │            │
│  │ - Inputs     │    │ - Field      │    │ - Validation │            │
│  │ - Enums      │    │   Resolvers  │    │ - Aggregation│            │
│  └──────────────┘    └──────────────┘    └──────────────┘            │
│         │                    │                    │                    │
│         └────────────────────┴────────────────────┘                    │
│                              │                                         │
│                              │ Prisma ORM                              │
│                              │ Query Builder                           │
└──────────────────────────────┼─────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         DATA LAYER                                      │
│                      (PostgreSQL Database)                              │
│                                                                         │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐            │
│  │   Tables     │    │   Views      │    │   Indexes    │            │
│  │              │    │              │    │              │            │
│  │ - Firs       │    │ - Advanced   │    │ - Performance│            │
│  │ - Accuseds   │    │   Search     │    │   Indexes    │            │
│  │ - Persons    │    │   Views      │    │ - Unique     │            │
│  │ - Users      │    │ - Summary    │    │   Constraints│            │
│  │ - Documents  │    │   Views      │    │              │            │
│  └──────────────┘    └──────────────┘    └──────────────┘            │
└─────────────────────────────────────────────────────────────────────────┘
```

#### Detailed Component Breakdown

**1. Frontend Application (`dopams-narco`)**

The frontend is a React-based single-page application (SPA) that provides the user interface for all system functionality. It's built using modern web technologies and follows best practices for performance, accessibility, and user experience.

**Key Characteristics:**
- **Single Page Application**: All navigation happens client-side, providing a smooth, app-like experience without full page reloads
- **Component-Based Architecture**: UI is built from reusable, composable components, promoting code reuse and maintainability
- **Type Safety**: Full TypeScript implementation ensures type safety across the entire frontend codebase
- **Responsive Design**: The UI adapts to different screen sizes, supporting desktop, tablet, and mobile devices
- **Real-Time Updates**: Apollo Client's caching and refetching mechanisms ensure users see the latest data

**2. Backend API (`dopams-backend`)**

The backend is a GraphQL API server built with Node.js that handles all business logic, data processing, and database interactions. GraphQL was chosen over REST for its flexibility, efficiency, and type safety.

**Key Characteristics:**
- **GraphQL API**: Single endpoint (`/graphql`) handles all queries and mutations, reducing over-fetching and under-fetching of data
- **Type System**: Strong typing through GraphQL schema ensures API contracts are clear and enforced
- **Resolver Pattern**: Business logic is organized in resolvers, making the codebase modular and testable
- **Service Layer**: Complex business logic is abstracted into service functions, keeping resolvers thin and focused
- **Error Handling**: Comprehensive error handling with appropriate error codes and messages

**3. Database (PostgreSQL)**

PostgreSQL serves as the persistent data store, chosen for its reliability, performance, and advanced features like JSON support, full-text search, and complex queries.

**Key Characteristics:**
- **Relational Database**: Normalized schema ensures data integrity and reduces redundancy
- **Views**: Database views provide optimized query paths for complex aggregations and searches
- **Indexes**: Strategic indexing ensures fast query performance even with large datasets
- **Transactions**: ACID compliance ensures data consistency and reliability

**4. Authentication System (JWT)**

JSON Web Tokens (JWT) are used for authentication, providing stateless authentication that scales well and integrates seamlessly with the GraphQL API.

**Key Characteristics:**
- **Stateless**: No server-side session storage required, reducing server load
- **Secure**: Tokens are signed and can include expiration times
- **Flexible**: Token payload can include user information, reducing need for additional queries

#### Data Flow Architecture

The system follows a unidirectional data flow pattern:

```
User Action
    │
    ▼
React Component (UI Event)
    │
    ▼
Apollo Client (Query/Mutation)
    │
    ▼
HTTP Request (GraphQL)
    │
    ▼
GraphQL Server (Schema Validation)
    │
    ▼
Resolver Function (Business Logic)
    │
    ▼
Service Function (Data Processing)
    │
    ▼
Prisma ORM (Database Query)
    │
    ▼
PostgreSQL (Data Retrieval/Modification)
    │
    ▼
Response (GraphQL Response)
    │
    ▼
Apollo Cache (Update Cache)
    │
    ▼
React Component (Re-render with New Data)
    │
    ▼
UI Update (User Sees Changes)
```

This unidirectional flow ensures predictable state management and makes debugging easier, as data always flows in one direction and state changes are traceable.

---

## Frontend Architecture & Technology Stack

### Technology Stack Overview

The frontend is built using a modern, type-safe technology stack that prioritizes developer experience, performance, and maintainability. Each technology choice was made to address specific requirements of the DOPAMS application.

#### Core Technologies

**Framework: React 18+ with TypeScript**
React 18 provides the foundation for building interactive user interfaces. The latest version includes features like concurrent rendering, automatic batching, and improved Suspense support, all of which contribute to a smoother user experience. TypeScript adds static type checking, catching errors at compile time rather than runtime, which significantly improves code quality and developer productivity. The combination ensures that components are both performant and type-safe.

**Routing: React Router v6**
React Router v6 handles client-side routing, enabling navigation between different pages without full page reloads. The router supports nested routes, route parameters, query strings, and programmatic navigation. This is essential for a single-page application where different URLs correspond to different views (e.g., `/case-status/firs/123` shows FIR detail page).

**State Management: Apollo Client (GraphQL client)**
Apollo Client serves dual purposes: it's both the GraphQL client for communicating with the backend and the primary state management solution for server data. Apollo Client provides intelligent caching, automatic query refetching, optimistic updates, and error handling. The cache is normalized, meaning that if the same data appears in multiple queries, it's stored once and shared, reducing memory usage and ensuring consistency.

**UI Library: Custom UI components (`@admintoystack/toystack-ui`)**
A custom component library provides consistent, reusable UI components across the application. This includes buttons, forms, tables, dialogs, cards, and other common UI elements. Using a component library ensures visual consistency, reduces development time, and makes it easier to maintain and update the UI.

**Table Management: TanStack Table (React Table) v8**
TanStack Table is a headless table library, meaning it provides table logic without imposing any UI. This gives developers complete control over the table's appearance while providing powerful features like sorting, filtering, pagination, column resizing, column visibility, and row selection. The library is framework-agnostic and highly performant, even with large datasets.

**Styling: Tailwind CSS**
Tailwind CSS is a utility-first CSS framework that allows rapid UI development through utility classes. Instead of writing custom CSS, developers apply pre-built utility classes directly in JSX. This approach leads to faster development, smaller CSS bundles (through purging unused styles), and consistent design. Tailwind's responsive utilities make it easy to create mobile-first, responsive designs.

**Build Tool: Vite**
Vite is a next-generation build tool that provides extremely fast development server startup and hot module replacement (HMR). Unlike traditional bundlers, Vite uses native ES modules in development, resulting in instant server starts regardless of application size. For production builds, Vite uses Rollup to create optimized bundles.

**Code Generation: GraphQL Code Generator**
GraphQL Code Generator automatically generates TypeScript types, React hooks, and other utilities from the GraphQL schema. This ensures that frontend code is always in sync with the backend API, provides autocomplete in IDEs, and catches API contract violations at compile time. When the schema changes, running the code generator updates all related types automatically.

### Frontend Project Structure

The frontend codebase is organized following React best practices, with clear separation of concerns and logical grouping of related functionality. This structure promotes code reusability, maintainability, and makes it easy for developers to locate and understand code.

```
dopams-narco/src/
│
├── routes/                    # Page components (route-based organization)
│   ├── home/                  # Dashboard/home page module
│   │   ├── index.tsx          # Main dashboard container
│   │   ├── main/              # Main dashboard components
│   │   │   ├── Overview.tsx   # Overall statistics cards
│   │   │   ├── CaseStatus.tsx # Case status chart
│   │   │   └── RegionalOverview.tsx # Regional breakdown
│   │   ├── fir-info/          # FIR-related charts
│   │   ├── accused-info/      # Accused-related charts
│   │   └── seizure-info/      # Seizure-related charts
│   │
│   ├── case-status/           # Case management module
│   │   ├── firs/              # FIR management
│   │   │   ├── index.tsx      # FIRs listing page
│   │   │   ├── filters.tsx    # FIR filters component
│   │   │   └── [id]/          # Dynamic route for FIR detail
│   │   │       ├── index.tsx  # FIR detail page
│   │   │       └── UploadFilesDialog.tsx # File upload
│   │   └── arrests/           # Arrests management
│   │       ├── index.tsx      # Arrests listing page
│   │       └── [id]/          # Accused profile detail
│   │
│   ├── crime-stats/           # Statistics and analytics module
│   │   ├── firs/              # FIR statistics
│   │   ├── arrests/           # Arrest statistics
│   │   └── seizures/          # Seizure statistics
│   │
│   ├── criminal-profile/      # Criminal profile module
│   │   ├── index.tsx          # Profiles listing
│   │   └── [id]/              # Profile detail with tabs
│   │
│   ├── search-tool/           # Advanced search module
│   │   ├── multi-vertical/     # Multi-entity search
│   │   ├── individuals/        # Individual search pages
│   │   └── fields.tsx         # Autocomplete component
│   │
│   ├── users/                 # User management module
│   │   ├── index.tsx          # Users listing
│   │   └── [Id]/              # User detail and management
│   │
│   └── login/                 # Authentication module
│       └── index.tsx          # Login page
│
├── components/                # Reusable UI components
│   ├── Card.tsx               # Card component
│   ├── Cell.tsx               # Table cell components
│   ├── DataGrid/              # Data grid components
│   │   ├── DataGrid.tsx       # Main grid component
│   │   ├── Table.tsx          # Table rendering
│   │   └── Pagination.tsx     # Pagination controls
│   └── LoadingIndicator.tsx   # Loading states
│
├── layouts/                   # Layout components
│   ├── SidebarLayout.tsx      # Main app layout with sidebar
│   └── main/                  # Layout sub-components
│
├── utils/                     # Utility functions
│   ├── auth.ts                # Authentication utilities
│   ├── date.ts                # Date formatting utilities
│   ├── pagination-helper.ts   # Apollo cache pagination
│   └── query-builder.ts       # Query construction helpers
│
├── __generated__/             # GraphQL generated code
│   ├── graphql.ts             # TypeScript types
│   └── gql.ts                 # Query/mutation definitions
│
└── main.tsx                   # Application entry point
    └── Apollo Client setup
    └── Router configuration
    └── Theme provider
```

#### Directory Purpose and Organization

**Routes Directory (`routes/`)**
The routes directory contains all page-level components, organized by feature module. Each route corresponds to a URL path in the application. Dynamic routes (using `[id]` or `[Id]` syntax) allow for parameterized URLs like `/case-status/firs/123` where `123` is the FIR ID. This organization makes it easy to understand the application's navigation structure and locate page-specific code.

**Components Directory (`components/`)**
Reusable UI components that are used across multiple pages are stored here. These components are designed to be generic and configurable, accepting props to customize their behavior and appearance. Examples include table components, form components, card components, and loading indicators. This promotes code reuse and ensures UI consistency.

**Layouts Directory (`layouts/`)**
Layout components define the overall structure and common elements (like sidebars, headers, footers) that appear on multiple pages. The `SidebarLayout` component, for example, wraps page content and provides the navigation sidebar that appears throughout the application.

**Utils Directory (`utils/`)**
Utility functions provide helper functionality that doesn't belong to any specific component. These include authentication helpers, date formatting functions, Apollo cache pagination helpers, and query builders. Keeping utilities separate makes them easy to test and reuse.

**Generated Directory (`__generated__/`)**
This directory contains code automatically generated by GraphQL Code Generator. Developers should never manually edit files in this directory, as they are regenerated whenever the GraphQL schema changes. The generated code includes TypeScript types that match the GraphQL schema, ensuring type safety throughout the application.

### Apollo Client Configuration

The frontend uses Apollo Client for GraphQL communication, configured in `main.tsx`. Apollo Client is a comprehensive state management library for JavaScript that enables you to manage both local and remote data with GraphQL. It's designed to be incrementally adoptable, so you can drop it into an existing JavaScript app and start using GraphQL for just part of your UI.

#### Apollo Client Architecture

Apollo Client uses a link-based architecture where different concerns (authentication, error handling, HTTP communication) are handled by separate "links" that are chained together. This modular approach makes it easy to add, remove, or modify functionality without affecting other parts of the system.

```
Apollo Client Request Flow:
┌─────────────────────────────────────────────────────────────┐
│                    Apollo Client                             │
│                                                              │
│  Query/Mutation Hook                                         │
│         │                                                    │
│         ▼                                                    │
│  ┌──────────────┐                                           │
│  │  Error Link  │  ← Handles errors globally                │
│  └──────┬───────┘                                           │
│         │                                                    │
│         ▼                                                    │
│  ┌──────────────┐                                           │
│  │  Auth Link   │  ← Adds JWT token to headers            │
│  └──────┬───────┘                                           │
│         │                                                    │
│         ▼                                                    │
│  ┌──────────────┐                                           │
│  │  HTTP Link   │  ← Sends HTTP request                    │
│  └──────┬───────┘                                           │
└─────────┼────────────────────────────────────────────────────┘
          │
          ▼
    GraphQL Server
```

#### Key Features and Configuration

**1. Authentication Link (`authLink`)**

The authentication link automatically injects the JWT token into every GraphQL request header. This ensures that authenticated requests include the necessary credentials without requiring developers to manually add headers to each query or mutation.

```typescript
const authLink = setContext((_, { headers }) => {
  return {
    headers: {
      ...headers,
      authorization: getAuthorizationHeader(), // Gets token from localStorage
      'Apollo-Require-Preflight': 'true', // Required for CORS preflight
    },
  };
});
```

**How it works:**
- `setContext` is an Apollo Link that modifies the context for each request
- Before each request is sent, this link runs and adds the authorization header
- `getAuthorizationHeader()` retrieves the stored JWT token (typically from localStorage)
- The token is added to headers in the format `Bearer <token>` or just `<token>`
- This link runs for every request, ensuring authentication is always included

**2. Error Link (`errorLink`)**

The error link provides centralized error handling, allowing the application to respond consistently to different types of errors. This is particularly important for authentication errors, which should trigger logout and redirect to the login page.

```typescript
const errorLink = onError(({ graphQLErrors, networkError, operation, forward }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path, extensions }) => {
      console.error(`GraphQL error: Message: ${message}, Location: ${locations}, Path: ${path}`);
      
      // Handle authentication errors globally
      if (extensions?.code === 'AUTHENTICATION_ERROR' || extensions?.code === 'UNAUTHENTICATED') {
        // Clear stored credentials
        // Redirect to login page
        // This ensures users are logged out if their token expires
      }
    });
  }

  if (networkError) {
    console.error(`[Network error]: ${networkError}`);
    // Handle network errors (connection issues, timeouts, etc.)
  }
});
```

**Error Types Handled:**
- **Authentication Errors**: Token expired, invalid token, unauthorized access
- **Network Errors**: Connection failures, timeouts, CORS issues
- **GraphQL Errors**: Validation errors, resolver errors, permission errors

**3. HTTP Link (`httpLink`)**

The HTTP link is responsible for actually sending requests to the GraphQL server. In this application, it's configured to use `apollo-upload-client` which extends the standard HTTP link with support for file uploads.

```typescript
import createUploadLink from 'apollo-upload-client/createUploadLink.mjs';

const httpLink = createUploadLink({
  uri: import.meta.env.VITE_GRAPHQL_BACKEND_URL, // GraphQL endpoint URL
  // Additional options can be configured here
});
```

**Features:**
- Supports standard GraphQL queries and mutations
- Handles file uploads using multipart/form-data
- Automatically serializes variables
- Handles response parsing

**4. Cache Configuration (`InMemoryCache`)**

Apollo Client uses an in-memory cache to store query results. This cache is normalized, meaning that objects with the same ID are stored once and shared across queries. The cache configuration includes custom type policies for paginated queries.

```typescript
const client = new ApolloClient({
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          users: paginationHelper(),
          firs: paginationHelper(['filters']),
          accuseds: paginationHelper(['filters']),
        },
      },
    },
  }),
});
```

**Cache Benefits:**
- **Performance**: Reduces network requests by serving cached data
- **Consistency**: Same data appears the same across different queries
- **Offline Support**: Cached data available even when offline
- **Optimistic Updates**: UI can update immediately before server confirms

**Pagination Helper:**
The custom `paginationHelper` ensures that when paginated queries are refetched with different parameters (like page number or filters), the cache correctly merges or replaces data. This prevents stale data from appearing and ensures pagination works correctly.

**5. Type Safety**

TypeScript types are automatically generated from the GraphQL schema using GraphQL Code Generator. This ensures:

- **Compile-time Safety**: Type errors are caught before runtime
- **Autocomplete**: IDEs provide intelligent autocomplete for queries and responses
- **Refactoring Safety**: Schema changes cause TypeScript errors, preventing breaking changes
- **Documentation**: Types serve as inline documentation

**Type Generation Process:**
```
GraphQL Schema (Backend)
        │
        ▼
GraphQL Code Generator
        │
        ▼
TypeScript Types (Frontend)
        │
        ▼
Used in Components (Type-safe)
```

#### Complete Apollo Client Setup

The complete Apollo Client configuration combines all links in the correct order:

```typescript
const client = new ApolloClient({
  link: from([errorLink, authLink.concat(httpLink)]), // Links execute in order
  connectToDevTools: process.env.NODE_ENV !== 'production', // Apollo DevTools in development
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          users: paginationHelper(),
          firs: paginationHelper(['filters']),
          accuseds: paginationHelper(['filters']),
        },
      },
    },
  }),
});
```

**Link Execution Order:**
1. **Error Link**: First in chain, catches errors from all subsequent links
2. **Auth Link**: Adds authentication headers
3. **HTTP Link**: Actually sends the request

This order ensures that authentication headers are added before the request is sent, and errors from any link are caught and handled appropriately.

---

## API Integration Patterns

Understanding how the frontend integrates with the GraphQL API is crucial for developers working on the DOPAMS application. This section provides comprehensive patterns, best practices, and detailed explanations of how queries and mutations are used throughout the application.

### Query Pattern

Queries are used to fetch data from the backend. The application follows a consistent pattern for all data fetching operations, ensuring predictable behavior and maintainable code.

#### Standard Query Flow

Most data fetching follows this comprehensive pattern:

```
┌─────────────────────────────────────────────────────────────┐
│                    Query Pattern Flow                        │
└─────────────────────────────────────────────────────────────┘

1. Define GraphQL Query
   │
   │ Using gql template literal
   │ With TypeScript types for type safety
   │
   ▼
2. Use Apollo Hook (useQuery or useLazyQuery)
   │
   │ Configure with variables, options
   │ Set up error/loading handling
   │
   ▼
3. Apollo Client Processing
   │
   │ Check cache first
   │ Add auth headers
   │ Send GraphQL request
   │
   ▼
4. Handle Response States
   │
   ├─ Loading State → Show loading indicator
   ├─ Error State → Show error message, allow retry
   └─ Success State → Process and display data
   │
   ▼
5. Transform Data (if needed)
   │
   │ Convert GraphQL response to UI format
   │ Calculate derived values
   │ Format dates, numbers, etc.
   │
   ▼
6. Render UI
   │
   │ Display data in tables, charts, cards
   │ Update Apollo cache automatically
   │
   ▼
7. Handle Updates
   │
   │ Refetch on filter/sort/pagination changes
   │ Update cache on mutations
   │ Optimistic updates when appropriate
```

#### Detailed Query Pattern Explanation

**Step 1: Define GraphQL Query**

Queries are defined using the `gql` template literal, which is provided by Apollo Client. The query definition includes:
- Query name (for debugging and DevTools)
- Variables (parameters passed to the query)
- Fields to fetch (what data is needed)
- Fragments (reusable field sets)

```typescript
import { gql } from '@apollo/client';

const GET_FIRS = gql`
  query Firs(
    $page: Int
    $limit: Int
    $sortKey: FirSortByEnumType
    $sortOrder: SortTypeEnumType
    $filters: FirFilterInputType
  ) {
    firs(
      page: $page
      limit: $limit
      sortKey: $sortKey
      sortOrder: $sortOrder
      filters: $filters
    ) {
      nodes {
        id
        firNumber
        unit
        ps
        year
        section
        crimeRegDate
        briefFacts
        noOfAccusedInvolved
        caseClassification
        caseStatus
        accusedDetails {
          id
          value
        }
        drugWithQuantity {
          name
          quantity
        }
      }
      pageInfo {
        isFirstPage
        isLastPage
        currentPage
        previousPage
        nextPage
        pageCount
        totalCount
      }
    }
  }
`;
```

**Key Points:**
- Variables are prefixed with `$` and typed
- The query name (`Firs`) should be descriptive and unique
- Fields are selected explicitly (GraphQL doesn't fetch everything by default)
- Nested fields (like `accusedDetails`) are included when needed
- Pagination metadata (`pageInfo`) is always included for list queries

**Step 2: Use Apollo Hook**

The `useQuery` hook is the primary way to execute queries in React components. It returns an object with data, loading state, error information, and helper functions.

```typescript
import { useQuery } from '@apollo/client';

const { 
  data,           // Query result data
  loading,        // Boolean: true while fetching
  error,          // Error object if query failed
  refetch,        // Function to manually refetch
  networkStatus,  // Detailed network status
  fetchMore,      // Function to fetch next page
} = useQuery(GET_FIRS, {
  variables: {
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
    sortKey: sorting[0]?.id,
    sortOrder: sorting[0]?.desc ? 'desc' : 'asc',
    filters: transformedFilters,
  },
  notifyOnNetworkStatusChange: true, // Important for background refetches
  fetchPolicy: 'cache-and-network',   // Use cache but also fetch fresh data
  errorPolicy: 'all',                 // Return both data and errors
});
```

**Hook Options Explained:**

- **`variables`**: Object containing values for query variables. When variables change, the query automatically refetches.

- **`notifyOnNetworkStatusChange`**: When `true`, the hook updates `networkStatus` during background refetches. This allows showing subtle loading indicators (like a spinner in a button) instead of full-page loading states.

- **`fetchPolicy`**: Controls how Apollo Client uses the cache:
  - `cache-first`: Check cache first, only fetch if not in cache
  - `cache-and-network`: Use cache immediately, but also fetch fresh data
  - `network-only`: Always fetch from network, ignore cache
  - `no-cache`: Fetch and don't cache the result

- **`errorPolicy`**: Controls error handling:
  - `none`: Return error, don't return partial data
  - `ignore`: Ignore errors, return partial data
  - `all`: Return both errors and partial data

**Step 3: Handle Loading States**

Loading states should be handled gracefully to provide good user experience. There are different types of loading states:

```typescript
// Full page loading (initial load)
if (loading && !data) {
  return <LoadingIndicator />;
}

// Background loading (refetch with existing data)
if (networkStatus === NetworkStatus.refetch) {
  // Show subtle indicator, keep existing data visible
  return (
    <div>
      <SubtleLoadingIndicator />
      <DataTable data={data} />
    </div>
  );
}

// Loading more (pagination)
if (networkStatus === NetworkStatus.fetchMore) {
  return (
    <div>
      <DataTable data={data} />
      <LoadingMoreIndicator />
    </div>
  );
}
```

**Step 4: Handle Error States**

Errors should be displayed clearly with options to retry:

```typescript
if (error) {
  return (
    <ErrorAlert 
      error={error} 
      onRetry={() => refetch()} 
    />
  );
}
```

**Step 5: Transform Data**

GraphQL responses often need transformation before display:

```typescript
const transformedData = useMemo(() => {
  if (!data?.firs?.nodes) return [];

  return data.firs.nodes.map(fir => ({
    ...fir,
    formattedDate: formatDateToDDMMYYYY(fir.crimeRegDate),
    accusedCount: fir.accusedDetails?.length || 0,
    drugNames: fir.drugWithQuantity?.map(d => d.name).join(', '),
  }));
}, [data]);
```

**Step 6: Render UI**

Finally, render the transformed data:

```typescript
return (
  <DataGrid
    data={transformedData}
    columns={columns}
    loading={loading}
    pagination={data?.firs?.pageInfo}
  />
);
```

#### Lazy Query Pattern

For queries that shouldn't execute immediately (like search queries that should only run when user clicks "Search"), use `useLazyQuery`:

```typescript
const [executeSearch, { data, loading, error }] = useLazyQuery(SEARCH_QUERY, {
  notifyOnNetworkStatusChange: true,
});

// Query doesn't execute until executeSearch is called
const handleSearch = () => {
  executeSearch({
    variables: {
      searchTerm: inputValue,
      filters: currentFilters,
    },
  });
};
```

**When to Use Lazy Queries:**
- Search functionality (don't search on every keystroke)
- Actions triggered by user buttons
- Queries that depend on user input before execution
- Expensive queries that shouldn't run on component mount

### Mutation Pattern

Mutations are used to modify data on the server (create, update, delete operations). Unlike queries, mutations are not automatically executed - they must be explicitly called, typically in response to user actions like button clicks or form submissions.

#### Standard Mutation Flow

```
┌─────────────────────────────────────────────────────────────┐
│                  Mutation Pattern Flow                       │
└─────────────────────────────────────────────────────────────┘

1. Define GraphQL Mutation
   │
   │ Using gql template literal
   │ Define input variables
   │ Specify return fields
   │
   ▼
2. Use Apollo Hook (useMutation)
   │
   │ Configure callbacks
   │ Set up error handling
   │
   ▼
3. User Action Triggers Mutation
   │
   │ Button click, form submit, etc.
   │ Call mutation function with variables
   │
   ▼
4. Optimistic Update (Optional)
   │
   │ Update UI immediately
   │ Show loading state
   │
   ▼
5. Server Processing
   │
   │ Backend validates input
   │ Performs operation
   │ Returns result
   │
   ▼
6. Handle Response
   │
   ├─ Success → onCompleted callback
   │   │
   │   ├─ Update Apollo cache
   │   ├─ Refetch related queries
   │   ├─ Show success message
   │   └─ Navigate/close dialogs
   │
   └─ Error → onError callback
       │
       ├─ Show error message
       ├─ Revert optimistic update
       └─ Allow retry
```

#### Detailed Mutation Pattern Explanation

**Step 1: Define GraphQL Mutation**

Mutations are defined similarly to queries, but they use the `mutation` keyword and typically include input variables:

```typescript
const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user {
        id
        email
        status
        role
        backgroundColor
        createdAt
        updatedAt
      }
    }
  }
`;
```

**Key Points:**
- Mutations use the `mutation` keyword instead of `query`
- Input variables are typically required (marked with `!`)
- Return fields specify what data to get back after the mutation
- Mutation names should be verbs (Login, CreateUser, UpdateStatus)

**Step 2: Use Apollo Hook**

The `useMutation` hook returns a tuple: `[mutationFunction, resultObject]`:

```typescript
const [login, { loading, error, data }] = useMutation(LOGIN_MUTATION, {
  onCompleted: (data) => {
    // Called when mutation succeeds
    console.log('Login successful:', data);
  },
  onError: (error) => {
    // Called when mutation fails
    console.error('Login failed:', error);
  },
});
```

**Hook Options:**

- **`onCompleted`**: Callback executed when mutation succeeds. Receives the mutation result data. Use this for:
  - Storing authentication tokens
  - Updating local state
  - Showing success messages
  - Navigating to other pages
  - Closing dialogs

- **`onError`**: Callback executed when mutation fails. Receives the error object. Use this for:
  - Displaying error messages
  - Logging errors
  - Reverting optimistic updates
  - Allowing user retry

- **`refetchQueries`**: Array of queries to refetch after mutation succeeds. Useful when mutation affects data shown elsewhere:

```typescript
const [updateUserRole] = useMutation(UPDATE_USER_ROLE_MUTATION, {
  refetchQueries: [
    { query: GET_USERS }, // Refetch users list
    { query: GET_USER, variables: { id: userId } }, // Refetch user detail
  ],
});
```

- **`awaitRefetchQueries`**: When `true`, waits for refetch queries to complete before calling `onCompleted`. Ensures UI shows latest data.

**Step 3: Execute Mutation**

Mutations are executed by calling the mutation function returned by `useMutation`:

```typescript
const handleLogin = async (email: string, password: string) => {
  try {
    const result = await login({
      variables: {
        email,
        password,
      },
    });
    
    // Handle success
    if (result.data?.login?.token) {
      storeLoginCredentials(result.data.login.user, result.data.login.token);
      navigate('/');
    }
  } catch (error) {
    // Error already handled by onError callback
    // But can also handle here if needed
  }
};
```

**Alternative: Using Callbacks Instead of Await**

```typescript
const handleLogin = (email: string, password: string) => {
  login({
    variables: { email, password },
    // onCompleted and onError handle the response
  });
};
```

**Step 4: Optimistic Updates**

For better UX, update the UI immediately before the server responds:

```typescript
const [updateUserStatus] = useMutation(UPDATE_USER_STATUS_MUTATION, {
  optimisticResponse: {
    updateUserStatus: {
      id: userId,
      status: newStatus,
      __typename: 'UserType',
    },
  },
  update: (cache, { data }) => {
    // Update cache with server response
    cache.writeQuery({
      query: GET_USER,
      variables: { id: userId },
      data: {
        user: data.updateUserStatus,
      },
    });
  },
});
```

**How Optimistic Updates Work:**
1. UI updates immediately with `optimisticResponse`
2. Mutation sent to server
3. If successful, `update` function runs with real data
4. If failed, Apollo reverts optimistic update automatically

**Step 5: Cache Updates**

After mutations, related queries may need cache updates:

```typescript
const [uploadFile] = useMutation(UPLOAD_FIR_FILE_MUTATION, {
  onCompleted: () => {
    // Option 1: Refetch the query
    refetch();
    
    // Option 2: Update cache directly
    cache.updateQuery(
      { query: GET_FIR, variables: { id: firId } },
      (data) => {
        // Modify data and return
        return {
          ...data,
          fir: {
            ...data.fir,
            documents: [...data.fir.documents, newDocument],
          },
        };
      }
    );
  },
});
```

#### Common Mutation Patterns

**Pattern 1: Form Submission**

```typescript
const [createUser, { loading, error }] = useMutation(CREATE_USER_MUTATION, {
  onCompleted: () => {
    toast.success('User created successfully');
    onClose(); // Close dialog
    refetchUsersList(); // Refresh list
  },
});

const handleSubmit = (formData) => {
  createUser({
    variables: {
      email: formData.email,
      password: formData.password,
      role: formData.role,
    },
  });
};
```

**Pattern 2: File Upload**

```typescript
const [uploadFile, { loading }] = useMutation(UPLOAD_FIR_FILE_MUTATION, {
  onCompleted: () => {
    toast.success('File uploaded successfully');
    refetch(); // Refresh FIR data to show new file
  },
});

const handleFileUpload = (file: File) => {
  uploadFile({
    variables: {
      file,
      firId: currentFirId,
    },
  });
};
```

**Pattern 3: Toggle/Update Operations**

```typescript
const [updateStatus, { loading }] = useMutation(UPDATE_USER_STATUS_MUTATION, {
  optimisticResponse: {
    updateUserStatus: {
      id: userId,
      status: newStatus,
    },
  },
});

const handleToggle = () => {
  updateStatus({
    variables: {
      id: userId,
      status: currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE',
    },
  });
};
```

### Filter Pattern

Many pages in the DOPAMS application use a sophisticated filtering system that allows users to narrow down large datasets based on multiple criteria. The filtering system is designed to be intuitive, performant, and persistent across sessions.

#### Filter System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                  Filter System Flow                          │
└─────────────────────────────────────────────────────────────┘

1. Filter UI Components
   │
   │ Dropdowns, date pickers, multi-selects
   │ User selects filter values
   │
   ▼
2. Filter State Management
   │
   ├─ Local Component State (immediate updates)
   └─ localStorage (persistence across sessions)
   │
   ▼
3. Filter Values Query (Optional)
   │
   │ Query available filter options
   │ Based on current filter context
   │ Populate dropdowns dynamically
   │
   ▼
4. Filter Transformation
   │
   │ Convert UI filter state to GraphQL filter input
   │ Handle empty arrays, undefined values
   │ Apply filter logic (AND/OR)
   │
   ▼
5. Apply to Main Query
   │
   │ Pass filters as query variables
   │ Query refetches with new filters
   │ Results update automatically
   │
   ▼
6. Filter Persistence
   │
   │ Save to localStorage
   │ Restore on page load
   │ User preferences maintained
```

#### Detailed Filter Pattern Explanation

**Step 1: Filter State Management**

Filters are managed using React state, with optional persistence to localStorage:

```typescript
// Filter state structure
interface FilterType {
  selectedDateFrom: string;
  selectedDateTo: string;
  selectedCaseClass: string[];
  selectedCaseStatus: string[];
  selectedPS: string[];
  selectedUnits: string[];
}

// Initialize from localStorage or defaults
const [filters, setFilters] = useState<FilterType>(() => {
  const saved = localStorage.getItem('fir-filters');
  return saved ? JSON.parse(saved) : INITIAL_FILTERS;
});

// Persist to localStorage on change
useEffect(() => {
  localStorage.setItem('fir-filters', JSON.stringify(filters));
}, [filters]);
```

**Benefits of localStorage Persistence:**
- Users don't lose filter selections when refreshing the page
- Filters persist across browser sessions
- Better user experience for frequent users
- Reduces need to re-apply common filters

**Step 2: Filter Values Query**

Many filter dropdowns are populated dynamically based on available data:

```typescript
// Query to get available filter values
const { data: filterValues } = useQuery(FIR_FILTER_VALUES, {
  variables: {
    filters: currentFilters, // Get values filtered by other selections
  },
});

// Use in dropdown
<Select
  options={filterValues?.firFilterValues?.ps || []}
  value={filters.selectedPS}
  onChange={(value) => setFilters(prev => ({ ...prev, selectedPS: value }))}
/>
```

**Why Filter Values Query is Important:**
- **Dynamic Options**: Options change based on other filter selections
- **Data Accuracy**: Only shows values that actually exist in filtered dataset
- **Performance**: Avoids loading all possible values upfront
- **User Experience**: Users only see relevant options

**Example:**
If user selects "Unit A", the PS (Police Station) dropdown only shows stations in Unit A, not all stations in the system.

**Step 3: Filter Transformation**

UI filter state must be transformed to GraphQL filter input format:

```typescript
const transformedFilters = useMemo(() => {
  const result: FirFilterInputType = {};
  
  // Date range
  if (filters.selectedDateFrom && filters.selectedDateTo) {
    result.dateRange = {
      from: filters.selectedDateFrom,
      to: filters.selectedDateTo,
    };
  }
  
  // Arrays - only include if not empty
  if (filters.selectedCaseStatus.length > 0) {
    result.caseStatus = filters.selectedCaseStatus;
  }
  
  if (filters.selectedPS.length > 0) {
    result.psName = filters.selectedPS;
  }
  
  if (filters.selectedUnits.length > 0) {
    result.units = filters.selectedUnits;
  }
  
  // Single values - only include if set
  if (filters.selectedCaseClass.length > 0) {
    result.caseClass = filters.selectedCaseClass;
  }
  
  return result;
}, [filters]);
```

**Transformation Rules:**
- Empty arrays are omitted (don't send `[]` to backend)
- Undefined/null values are omitted
- Date ranges are converted to `{from, to}` objects
- String values are passed as-is
- Arrays are passed when they have values

**Step 4: Apply Filters to Query**

Transformed filters are passed to the main data query:

```typescript
const { data, loading } = useQuery(GET_FIRS, {
  variables: {
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
    filters: transformedFilters, // Applied here
  },
});
```

**Filter Application Behavior:**
- When `transformedFilters` changes, query automatically refetches
- `useMemo` ensures transformation only runs when filters change
- Apollo Client caches results per filter combination
- Previous results remain visible during refetch (with `notifyOnNetworkStatusChange`)

**Step 5: Filter UI Components**

Filter components provide intuitive interfaces for selecting filter values:

```typescript
<Filters>
  <DateRangePicker
    from={filters.selectedDateFrom}
    to={filters.selectedDateTo}
    onChange={(from, to) => setFilters(prev => ({
      ...prev,
      selectedDateFrom: from,
      selectedDateTo: to,
    }))}
  />
  
  <MultiSelect
    label="Case Status"
    options={filterValues?.caseStatus || []}
    value={filters.selectedCaseStatus}
    onChange={(value) => setFilters(prev => ({
      ...prev,
      selectedCaseStatus: value,
    }))}
  />
  
  <MultiSelect
    label="Police Station"
    options={filterValues?.ps || []}
    value={filters.selectedPS}
    onChange={(value) => setFilters(prev => ({
      ...prev,
      selectedPS: value,
    }))}
  />
  
  <Button onClick={() => setFilters(INITIAL_FILTERS)}>
    Clear Filters
  </Button>
</Filters>
```

#### Advanced Filter Patterns

**Pattern 1: Dependent Filters**

Some filters depend on other filter selections:

```typescript
// PS filter values depend on selected units
const { data: psFilterValues } = useQuery(FIR_FILTER_VALUES, {
  variables: {
    filters: {
      units: filters.selectedUnits, // Only get PS in selected units
    },
  },
  skip: filters.selectedUnits.length === 0, // Don't query if no units selected
});
```

**Pattern 2: Filtered Filter Values**

Filter values query can be filtered by current selections:

```typescript
// Get filter values that match current filters
const { data: filteredValues } = useQuery(ACCUSED_FILTER_VALUES, {
  variables: {
    filters: {
      // Apply current filters to get relevant values
      caseStatus: filters.selectedCaseStatus,
      ps: filters.selectedPS,
    },
  },
});
```

**Pattern 3: Search Within Filters**

Some filters support search/autocomplete:

```typescript
const [searchTerm, setSearchTerm] = useState('');

const { data: searchResults } = useQuery(FIELD_AUTOCOMPLETE, {
  variables: {
    input: searchTerm,
    fields: ['psName', 'unit'],
  },
  skip: searchTerm.length < 2, // Only search after 2 characters
});
```

#### Filter Best Practices

1. **Always Provide Clear Filters**: Include a "Clear All" button
2. **Show Active Filter Count**: Display how many filters are active
3. **Persist User Preferences**: Save filters to localStorage
4. **Debounce Expensive Filters**: Don't query on every keystroke
5. **Show Loading States**: Indicate when filters are being applied
6. **Validate Filter Combinations**: Ensure filters make sense together
7. **Remember Last Used**: Restore filters from previous session
8. **Provide Filter Presets**: Common filter combinations as shortcuts

---

## Detailed Frontend API Usage by Page/Module

### 1. Home/Dashboard Module (`routes/home/`)

**Purpose**: Main dashboard displaying comprehensive crime statistics and analytics

**Components & API Usage:**

#### `routes/home/index.tsx` - Main Dashboard Container
- **Role**: Orchestrates all dashboard components and manages date range filter
- **State Management**: 
  - Date range state (`from`, `to`) passed to child components
  - Date range persisted via component state
- **API Integration**: No direct API calls; delegates to child components
- **Child Components**: 
  - `Overview.tsx` - Overall statistics
  - `RegionalOverview.tsx` - Regional breakdown
  - `CaseStatus.tsx` - Case status classification
  - `DrugData.tsx` - Drug seizure data
  - Various classification charts

#### `routes/home/main/Overview.tsx`
- **API**: `overallCrimeStats`
- **Purpose**: Displays high-level statistics (total FIRs, accused, seizures worth)
- **Integration**: 
  - Uses `useQuery` hook with `from` and `to` date parameters
  - Automatically refetches when date range changes
  - Displays loading state during fetch
- **Data Flow**: 
  ```
  Date Range Change → Component Re-render → Query Refetch → Display Updated Stats
  ```

#### `routes/home/main/RegionalOverview.tsx`
- **API**: `regionalOverview`
- **Purpose**: Shows crime statistics broken down by unit/region
- **Integration**: 
  - Query with date range parameters
  - Data transformed for chart visualization
  - Responsive grid layout for regional cards

#### `routes/home/main/CaseStatus.tsx`
- **API**: `caseStatusClassification`
- **Purpose**: Pie/bar chart showing case status distribution
- **Integration**: 
  - Query returns array of `{label, value}` objects
  - Data formatted for chart library
  - Color-coded by status type

#### `routes/home/seizure-info/DrugData.tsx`
- **APIs**: 
  - `drugData` (main query)
  - `seizuresFilterValues` (for drug options dropdown)
- **Purpose**: Interactive drug data visualization with multi-drug selection
- **Integration**: 
  - Two queries: one for drug options, one for selected drug data
  - User selects drugs from dropdown → triggers `drugData` query with `drugNames` array
  - Chart updates dynamically based on selection
- **Special Features**: 
  - Debounced search for drug selection
  - Multi-select drug filtering
  - Date range filtering

#### Other Home Components
- `routes/home/fir-info/CaseClassificationUI.tsx` → `caseClassificationUI`
- `routes/home/fir-info/TrailCasesClassification.tsx` → `trialCasesClassification`
- `routes/home/fir-info/UICasesTimeline.tsx` → `stipulatedTimeClassification`
- `routes/home/accused-info/AccusedCategory.tsx` → `accusedTypeClassification`
- `routes/home/accused-info/DomicileClassification.tsx` → `domicileClassification`
- `routes/home/seizure-info/DrugTypes.tsx` → `drugCases`

**Common Pattern**: All home components follow similar pattern:
1. Receive `from` and `to` props from parent
2. Execute query with date parameters
3. Transform data for visualization
4. Display loading/error states

---

### 2. Case Status - FIRs Module (`routes/case-status/firs/`)

**Purpose**: Management and viewing of First Information Reports (FIRs)

#### `routes/case-status/firs/index.tsx` - FIRs Listing Page
- **API**: `firs` (main query)
- **Purpose**: Paginated, filterable, sortable table of all FIRs
- **Key Features**:
  - **Pagination**: Server-side pagination with configurable page size
  - **Sorting**: Multi-column sorting via TanStack Table
  - **Filtering**: Complex filter system with multiple criteria
  - **Search**: Text search with debouncing
  - **State Persistence**: Filters, sorting, pagination saved to localStorage
  - **Export**: PDF/Excel export functionality

**API Integration Details:**
```typescript
// Query with dynamic variables
const { data, loading, error, networkStatus, refetch } = useQuery(GET_FIRS, {
  variables: {
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
    sortKey: sorting[0]?.id,
    sortOrder: sorting[0]?.desc ? 'desc' : 'asc',
    filters: transformedFilters,
  },
  notifyOnNetworkStatusChange: true, // Keeps previous data during refetch
});

// Filter transformation
const transformedFilters = useMemo(() => {
  // Convert UI filter state to GraphQL filter input
  return {
    dateRange: filters.selectedDateFrom && filters.selectedDateTo ? {
      from: filters.selectedDateFrom,
      to: filters.selectedDateTo,
    } : undefined,
    caseStatus: filters.selectedCaseStatus.length > 0 ? filters.selectedCaseStatus : undefined,
    psName: filters.selectedPS.length > 0 ? filters.selectedPS : undefined,
    // ... more filter mappings
  };
}, [filters]);
```

**State Management Flow:**
1. User interacts with filters/search/sorting → Local state updates
2. State changes trigger `useMemo` to compute query variables
3. Apollo Client detects variable changes → Refetches query
4. New data arrives → Table updates
5. State persisted to localStorage for next visit

**Filter Integration**: Uses `firFilterValues` query in `filters.tsx` component to populate dropdown options dynamically.

#### `routes/case-status/firs/[id]/index.tsx` - FIR Detail Page
- **API**: `fir` (single FIR query)
- **Purpose**: Comprehensive view of a single FIR with all related data
- **Integration**:
  - Uses route parameter `id` to fetch FIR details
  - Displays data in tabbed interface (Overview, Property, Chargesheets, etc.)
  - Handles loading and error states
  - Supports file uploads via `uploadFirFile` mutation
- **Data Structure**: Receives complete FIR object with nested relations:
  - Accused details
  - Property details
  - MO seizures
  - Chargesheets
  - Documents
  - Interrogation reports

**File Upload Integration:**
```typescript
const [uploadFirFile] = useMutation(UPLOAD_FIR_FILE_MUTATION, {
  onCompleted: () => {
    refetch(); // Refresh FIR data to show new document
  },
});
```

---

### 3. Case Status - Arrests Module (`routes/case-status/arrests/`)

**Purpose**: Management and viewing of arrested accused persons

#### `routes/case-status/arrests/index.tsx` - Arrests Listing Page
- **API**: `accuseds` (main query)
- **Purpose**: Paginated table of all accused/arrested persons
- **Integration Pattern**: Similar to FIRs listing but with different filters:
  - Age range filtering
  - Gender, nationality, state filtering
  - Accused status and type filtering
  - Domicile filtering
- **Key Differences from FIRs**:
  - Uses `AccusedFilterInputType` instead of `FirFilterInputType`
  - Different columns displayed (personal info, case info, previous involvement)
  - Different sort options

**Filter Integration**: Uses `accusedFilterValues` query to populate filter dropdowns with available values.

#### `routes/case-status/arrests/[id]/index.tsx` - Accused Profile Detail
- **API**: `accused` (single accused query)
- **Purpose**: Detailed view of an accused person's profile
- **Integration**: 
  - Fetches complete accused record by `accusedId`
  - Displays personal information, physical description, addresses
  - Shows associated FIRs and case information
  - Displays previous involvement cases
  - Shows drug-related information

---

### 4. Criminal Profile Module (`routes/criminal-profile/`)

**Purpose**: Deduplicated criminal profiles with complete case history

#### `routes/criminal-profile/index.tsx` - Criminal Profiles Listing
- **API**: `criminalProfiles`
- **Purpose**: List of all criminal profiles (deduplicated persons)
- **Integration**:
  - Paginated list with sorting
  - Name-based filtering
  - Displays profile summary with crime count
  - Links to detailed profile pages

#### `routes/criminal-profile/[id]/index.tsx` - Criminal Profile Detail
- **API**: `criminalProfile` (single profile query)
- **Purpose**: Comprehensive criminal profile with all associated crimes
- **Key Features**:
  - **Tabbed Interface**: Overview, Crime History, Documents, Interrogation Data
  - **Case History**: Shows all crimes associated with this person (deduplicated)
  - **Document Management**: File uploads via `uploadCriminalProfileFile` mutation
  - **PDF Export**: Export profile to PDF
- **Data Structure**: Receives complete profile with:
  - Personal information (present & permanent addresses)
  - Contact details
  - Associated crimes array
  - Documents and identity documents
  - Arrest count and associated drugs

**Crime History Display**: Uses `criminalProfile.crimes` array to display case history. Note: The backend also provides `accusedCaseHistory` API for deduplicated case history, but the UI currently uses the crimes array from the profile query.

---

### 5. Advanced Search Module (`routes/search-tool/`)

**Purpose**: Powerful multi-vertical search across FIRs, accused, and related entities

#### `routes/search-tool/multi-vertical/index.tsx` - Multi-Vertical Search
- **API**: `advancedSearch`
- **Purpose**: Complex search with multiple filter criteria and field selection
- **Key Features**:
  - **Dynamic Filter Builder**: Users can add multiple search criteria
  - **Field Selection**: Users can choose which columns to display
  - **Operators**: Supports equals, contains, greaterThan, lessThan, between, etc.
  - **Connectors**: AND/OR logic for combining filters
  - **Column Management**: Users can show/hide columns dynamically

**API Integration:**
```typescript
const { data, loading, error, networkStatus } = useQuery(ADVANCED_SEARCH, {
  variables: {
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
    sortKey: sorting[0]?.id,
    sortOrder: sorting[0]?.desc ? 'desc' : 'asc',
    filters: searchCriteria.map(criteria => ({
      field: criteria.field,
      operator: criteria.operator,
      connector: criteria.connector,
      value: criteria.value,
      value2: criteria.value2,
    })),
    select: visibleColumns, // Only fetch selected columns
  },
});
```

**Filter Building Flow:**
1. User adds search criteria → Criteria added to state
2. User selects field, operator, value → Criteria object created
3. User clicks "Search" → Query executed with all criteria
4. Results displayed in table with selected columns only

#### `routes/search-tool/fields.tsx` - Field Autocomplete
- **API**: `fieldAutoComplete`
- **Purpose**: Provides autocomplete suggestions for search field values
- **Integration**:
  - Debounced input triggers query
  - Multiple fields can be searched simultaneously
  - Results displayed as dropdown suggestions
  - Used within search criteria builder

#### `routes/search-tool/individuals/` - Individual Search Pages
- **FIRBasedSearch.tsx**: Uses `firs` query with name-based filtering
- **DrugBasedSearch.tsx**: Uses `firs` query with drug type filtering
- **OffenderBasedSearch.tsx**: Uses `accuseds` query with name-based filtering

**Pattern**: All use `useLazyQuery` to execute search only when user clicks "Search Records" button, not on every keystroke.

---

### 6. Crime Statistics Module (`routes/crime-stats/`)

**Purpose**: Statistical analysis and visualization of crime data

#### `routes/crime-stats/firs/FirsAbstract.tsx`
- **API**: `firsAbstract`
- **Purpose**: Hierarchical data structure for FIR statistics by unit/station/year
- **Integration**:
  - Fetches abstract data with filters
  - Transforms GraphQL response to nested table structure
  - Supports expandable rows (units → stations → years)
  - Displays multiple metrics (under investigation, pending trial, disposed, etc.)
- **Data Transformation**: 
  ```typescript
  // Backend returns: { years: [], units: [{ children: [], totalsByYear: [] }] }
  // Frontend transforms to: { years: [], units: [{ children: [], totalsByYear: {} }] }
  // Converts arrays to objects for easier lookup
  ```

#### `routes/crime-stats/firs/FirsStats.tsx`
- **API**: `firStatistics`
- **Purpose**: Summary statistics cards for FIRs
- **Integration**: Simple query with optional filters, displays aggregated counts

#### `routes/crime-stats/firs/GenerateGraph.tsx`
- **API**: `firsAbstract`
- **Purpose**: Generates charts/graphs from abstract data
- **Integration**: Uses same abstract data, transforms for chart library consumption

#### `routes/crime-stats/arrests/` - Similar Pattern
- `ArrestsAbstract.tsx` → `accusedAbstract`
- `AccusedStats.tsx` → `accusedStatistics`
- `GenerateGraph.tsx` → `accusedAbstract`

#### `routes/crime-stats/seizures/` - Similar Pattern
- `SeizuresAbstract.tsx` → `seizuresAbstract`
- `SeizuresStats.tsx` → `seizureStatistics`
- `GenerateGraph.tsx` → `seizuresAbstract`

**Common Pattern**: All statistics pages follow:
1. Filter component → Updates filter state
2. Abstract/Stats query → Fetches aggregated data
3. Data transformation → Formats for display
4. Visualization → Charts/tables/graphs

---

### 7. User Management Module (`routes/users/`)

**Purpose**: User account management and administration

#### `routes/users/index.tsx` - Users Listing
- **API**: `users`
- **Purpose**: Paginated list of all system users
- **Integration**: Standard pagination pattern with sorting

#### `routes/users/[Id]/index.tsx` - User Detail
- **API**: `user` (single user query)
- **Purpose**: View and manage individual user account
- **Integration**: 
  - Fetches user by ID
  - Displays user information
  - Provides components for role/status updates

#### `routes/users/CreateUserDialogButton.tsx` - Create User
- **API**: `createUser` mutation
- **Purpose**: Admin-only user creation
- **Integration**:
  ```typescript
  const [createUser, { loading, error }] = useMutation(CREATE_USER_MUTATION, {
    onCompleted: (data) => {
      // Refresh users list or show success message
    },
  });
  ```

#### `routes/users/[Id]/UpdateUserRole.tsx` & `UpdateUserStatus.tsx`
- **APIs**: `updateUserRole`, `updateUserStatus` mutations
- **Purpose**: Update user permissions and account status
- **Integration**: Mutation with refetch on success

#### `components/ThemeCustomizer.tsx` - Theme Customization
- **API**: `updateUserBackgroundColor` mutation
- **Purpose**: User preference for UI background color
- **Integration**: Mutation updates user preference, UI updates immediately

---

### 8. Authentication Module (`routes/login/`)

**Purpose**: User authentication and session management

#### `routes/login/index.tsx` - Login Page
- **API**: `login` mutation
- **Purpose**: Authenticate user and establish session
- **Integration**:
  ```typescript
  const [login, { loading, error }] = useMutation(LOGIN_MUTATION, {
    onCompleted: (data) => {
      if (data?.login?.token) {
        storeLoginCredentials(data.login.user, data.login.token);
        navigate('/'); // Redirect to dashboard
      }
    },
  });
  ```
- **Flow**:
  1. User enters email/password
  2. Form submission triggers mutation
  3. On success: Token stored, user data cached, redirect to dashboard
  4. On error: Error message displayed

---

### 9. Criminal Network Module (`routes/criminal-network/`)

**Purpose**: Visualize relationships between criminals and crimes

#### `routes/criminal-network/[personId]/index.tsx` - Network Visualization
- **API**: `criminalNetworkDetails`
- **Purpose**: Display network graph showing person-crime relationships
- **Integration**:
  - Fetches network data for a person
  - Data structure includes nested relationships (person → crimes → related persons → their crimes)
  - Transforms data for graph visualization library
  - Interactive network graph with nodes and edges

---

## Data Flow & State Management

Understanding how data flows through the application is crucial for debugging, optimization, and adding new features. This section provides comprehensive coverage of data flow patterns, state management strategies, and caching mechanisms.

### Apollo Client Cache Strategy

The application uses Apollo Client's InMemoryCache with custom type policies to handle complex scenarios like pagination, filtering, and data normalization. The cache is a normalized, in-memory data store that automatically updates when queries or mutations complete.

#### Cache Architecture

```
┌─────────────────────────────────────────────────────────────┐
│              Apollo Client Cache Structure                    │
└─────────────────────────────────────────────────────────────┘

Normalized Cache (by ID)
│
├─ FIR:123 → { id: "123", firNumber: "255/2022", ... }
├─ FIR:456 → { id: "456", firNumber: "256/2022", ... }
├─ Accused:789 → { id: "789", fullName: "John Doe", ... }
└─ User:101 → { id: "101", email: "user@example.com", ... }

Query Results Cache
│
├─ Query:firs({page:1, filters:{}}) → [FIR:123, FIR:456]
├─ Query:firs({page:2, filters:{}}) → [FIR:789, FIR:101]
└─ Query:fir({id:"123"}) → FIR:123
```

#### Custom Type Policies

The application uses custom type policies to handle pagination correctly:

```typescript
cache: new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        users: paginationHelper(),
        firs: paginationHelper(['filters']),
        accuseds: paginationHelper(['filters']),
      },
    },
  },
})
```

**How Pagination Helper Works:**

The `paginationHelper` function creates a custom field policy that:

1. **Merges Paginated Results**: When fetching page 2, it merges with page 1 instead of replacing
2. **Respects Filter Keys**: For queries with filters, it creates separate cache entries per filter combination
3. **Handles Variables**: Different variable combinations create different cache entries

**Example:**
```typescript
// First query: page 1, no filters
Query:firs({page:1, filters:undefined}) → [FIR:1, FIR:2, FIR:3]

// Second query: page 2, no filters
Query:firs({page:2, filters:undefined}) → [FIR:1, FIR:2, FIR:3, FIR:4, FIR:5]
// Merged with previous results

// Third query: page 1, with filters
Query:firs({page:1, filters:{caseStatus:["Pending"]}}) → [FIR:2, FIR:4]
// Separate cache entry due to different filters
```

**Benefits:**
- **Performance**: Subsequent page loads are instant (served from cache)
- **Consistency**: Same data appears the same across queries
- **Memory Efficiency**: Objects stored once, referenced multiple times
- **Offline Support**: Cached data available when network unavailable

#### Cache Update Strategies

**Strategy 1: Automatic Refetch**

After mutations, related queries can be automatically refetched:

```typescript
const [updateUser] = useMutation(UPDATE_USER_MUTATION, {
  refetchQueries: [{ query: GET_USERS }],
});
```

**Strategy 2: Manual Cache Update**

Update cache directly without refetching:

```typescript
const [uploadFile] = useMutation(UPLOAD_FILE_MUTATION, {
  update: (cache, { data }) => {
    cache.modify({
      id: cache.identify({ __typename: 'FirType', id: firId }),
      fields: {
        documents(existingDocuments = []) {
          return [...existingDocuments, data.uploadFile];
        },
      },
    });
  },
});
```

**Strategy 3: Optimistic Updates**

Update UI immediately, revert if mutation fails:

```typescript
const [updateStatus] = useMutation(UPDATE_STATUS_MUTATION, {
  optimisticResponse: {
    updateStatus: {
      id: itemId,
      status: newStatus,
      __typename: 'ItemType',
    },
  },
});
```

### State Management Patterns

The DOPAMS application uses a multi-layered state management approach, with different types of state stored in appropriate locations based on their purpose, lifetime, and sharing requirements.

#### State Management Architecture

```
┌─────────────────────────────────────────────────────────────┐
│              State Management Layers                         │
└─────────────────────────────────────────────────────────────┘

Layer 1: Component State (React useState)
│
├─ UI State (modals, dropdowns, form inputs)
├─ Temporary State (loading indicators, error messages)
└─ Component-specific State (doesn't need sharing)
│
│ Lifetime: Component mount/unmount
│ Scope: Single component
│ Persistence: None (lost on unmount)
│
▼
Layer 2: Apollo Cache (Server Data)
│
├─ Query Results (FIRs, accused, users, etc.)
├─ Normalized Objects (by ID)
└─ Pagination State
│
│ Lifetime: Until cache eviction or app restart
│ Scope: Global (shared across components)
│ Persistence: In-memory (lost on refresh)
│
▼
Layer 3: localStorage (User Preferences)
│
├─ Filter Selections
├─ Sorting Preferences
├─ Pagination Settings
└─ UI Preferences (theme, column visibility)
│
│ Lifetime: Until user clears browser data
│ Scope: Per user, per browser
│ Persistence: Browser storage
│
▼
Layer 4: URL Parameters (Shareable State)
│
├─ Current Page/Route
├─ Entity IDs (/firs/123)
└─ Query Parameters (?filter=value)
│
│ Lifetime: Until URL changes
│ Scope: Shareable via URL
│ Persistence: Browser history
```

#### Detailed State Management Patterns

**Pattern 1: Local Component State**

Use React's `useState` for UI-only state that doesn't need to be shared:

```typescript
// Modal open/close state
const [isModalOpen, setIsModalOpen] = useState(false);

// Form input values
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');

// Dropdown selection
const [selectedOption, setSelectedOption] = useState(null);

// Loading state (if not using Apollo's loading)
const [isSubmitting, setIsSubmitting] = useState(false);
```

**When to Use:**
- State is only used within the component
- State doesn't need to persist across page refreshes
- State doesn't need to be shared with other components
- State is temporary (like form inputs before submission)

**Pattern 2: Apollo Cache (Server Data)**

Apollo Client automatically caches all query results. This is the primary state management for server data:

```typescript
// Query automatically caches results
const { data } = useQuery(GET_FIRS, {
  variables: { page: 1, limit: 100 },
});

// Data is cached and available to other components
// Other components can read from cache without refetching
```

**Cache Benefits:**
- **Automatic**: No manual cache management needed
- **Normalized**: Same object stored once, referenced multiple times
- **Consistent**: Same data appears the same everywhere
- **Performant**: Instant access to cached data

**Pattern 3: localStorage (User Preferences)**

Use localStorage for user preferences that should persist across sessions:

```typescript
import { useLocalStorage } from 'usehooks-ts';

// Filters persisted to localStorage
const [filters, setFilters] = useLocalStorage('fir-filters', {
  selectedDateFrom: '',
  selectedDateTo: '',
  selectedCaseStatus: [],
  selectedPS: [],
});

// Sorting preferences
const [sorting, setSorting] = useLocalStorage('fir-sorting', [
  { id: 'crimeRegDate', desc: true },
]);

// Pagination preferences
const [pagination, setPagination] = useLocalStorage('fir-pagination', {
  pageIndex: 0,
  pageSize: 100,
});
```

**When to Use localStorage:**
- User preferences (filters, sorting, pagination)
- UI settings (theme, column visibility)
- Form drafts (save progress)
- Recent searches

**Benefits:**
- Persists across browser sessions
- Improves user experience (remembers preferences)
- Reduces need to re-apply common filters
- Works offline (for reading)

**Pattern 4: URL Parameters (Shareable State)**

Use URL parameters for state that should be shareable:

```typescript
// Route parameters
/case-status/firs/123  // FIR ID in URL

// Query parameters
/case-status/firs?page=2&status=Pending  // Filters in URL

// Access via React Router
const { id } = useParams(); // Gets "123" from route
const [searchParams] = useSearchParams(); // Gets query params
const page = searchParams.get('page'); // Gets "2"
```

**When to Use URL Parameters:**
- Entity IDs (for detail pages)
- Shareable filters (users can share URLs)
- Deep linking (bookmarkable states)
- Browser back/forward navigation

**Benefits:**
- Shareable via URL
- Bookmarkable
- Browser history support
- SEO-friendly (for public pages)

### Data Flow Example: FIRs Listing Page

Understanding the complete data flow for a specific page helps illustrate how all the pieces work together. Let's trace through what happens when a user changes filters on the FIRs listing page.

#### Complete Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│         FIRs Listing Page - Filter Change Flow              │
└─────────────────────────────────────────────────────────────┘

Step 1: User Interaction
│
│ User selects "Pending" in Case Status filter dropdown
│
▼
Step 2: Event Handler Execution
│
│ onChange handler fires: setFilters(prev => ({
│   ...prev,
│   selectedCaseStatus: ["Pending"]
│ }))
│
▼
Step 3: React State Update
│
│ filters state updates
│ Component re-renders with new filter state
│
▼
Step 4: useMemo Recalculation
│
│ useMemo detects filters dependency changed
│ Recomputes transformedFilters:
│   {
│     caseStatus: ["Pending"],
│     psName: undefined,  // Empty arrays omitted
│     units: undefined,
│     ...
│   }
│
▼
Step 5: Apollo Client Variable Detection
│
│ useQuery detects variables changed:
│   Before: { page: 1, filters: {} }
│   After:  { page: 1, filters: { caseStatus: ["Pending"] } }
│
▼
Step 6: Cache Check
│
│ Apollo checks cache for this query + variables combination
│ Cache miss → Need to fetch from network
│ (If cache hit, would return cached data immediately)
│
▼
Step 7: Network Request Preparation
│
│ Apollo Client prepares GraphQL request:
│   - Adds authentication header (via authLink)
│   - Serializes variables
│   - Creates GraphQL query string
│
▼
Step 8: HTTP Request Sent
│
│ POST /graphql
│ {
│   "query": "query Firs($page: Int, $filters: FirFilterInputType) { ... }",
│   "variables": {
│     "page": 1,
│     "limit": 100,
│     "filters": { "caseStatus": ["Pending"] }
│   }
│ }
│
▼
Step 9: Backend Processing
│
│ GraphQL Server:
│   1. Validates query and variables
│   2. Executes resolver function
│   3. Resolver calls service function
│   4. Service queries database with filters
│   5. Database returns filtered results
│   6. Service transforms data
│   7. Resolver returns to GraphQL
│
▼
Step 10: Response Received
│
│ {
│   "data": {
│     "firs": {
│       "nodes": [
│         { "id": "123", "firNumber": "255/2022", "caseStatus": "Pending", ... },
│         { "id": "456", "firNumber": "256/2022", "caseStatus": "Pending", ... }
│       ],
│       "pageInfo": {
│         "currentPage": 1,
│         "totalCount": 45,
│         ...
│       }
│     }
│   }
│ }
│
▼
Step 11: Apollo Cache Update
│
│ Apollo Client:
│   1. Normalizes response data
│   2. Stores objects by ID in cache
│   3. Stores query result reference
│   4. Updates component with new data
│
▼
Step 12: Component Re-render
│
│ useQuery returns:
│   {
│     data: { firs: { nodes: [...], pageInfo: {...} } },
│     loading: false,
│     error: undefined,
│     networkStatus: NetworkStatus.ready
│   }
│
▼
Step 13: Data Transformation
│
│ useMemo transforms data for table:
│   - Formats dates
│   - Calculates derived values
│   - Maps to table row format
│
▼
Step 14: UI Update
│
│ Table component receives new data
│ Renders rows with filtered FIRs
│ Shows "45 results" in pagination info
│
▼
Step 15: localStorage Persistence
│
│ useEffect detects filters changed
│ Saves to localStorage:
│   localStorage.setItem('fir-filters', JSON.stringify(filters))
│
▼
Step 16: Complete
│
│ User sees filtered results
│ Filters persist for next visit
│ Cache ready for instant access
```

#### Key Points in the Flow

**Performance Optimizations:**

1. **useMemo for Filter Transformation**: Prevents unnecessary recalculations
2. **Apollo Cache**: Subsequent loads of same filters are instant
3. **Normalized Cache**: Same FIR object stored once, referenced multiple times
4. **Background Refetch**: Previous data visible during refetch (better UX)

**State Synchronization:**

- **React State**: Immediate UI updates (dropdowns, inputs)
- **Apollo Cache**: Server data synchronization
- **localStorage**: Persistence across sessions
- **URL**: Shareable state (if implemented)

**Error Handling:**

If any step fails:
- Network error → Error link catches it → Shows error message
- GraphQL error → Error returned in response → Component shows error
- Validation error → Backend rejects → Error shown to user

#### Parallel Data Flows

Some operations happen in parallel:

```
Filter Change
    │
    ├─→ Main Query (GET_FIRS) ──┐
    │                            │
    └─→ Filter Values Query ─────┼─→ Both complete independently
         (GET_FIR_FILTER_VALUES) ┘
```

Both queries execute simultaneously, improving perceived performance.

### Refetch Patterns

**Automatic Refetch**: Used when:
- Filters change
- Sorting changes
- Pagination changes
- User clicks refresh

**Manual Refetch**: Used when:
- File uploads complete
- Mutations succeed
- User explicitly requests refresh

**Refetch Strategy**: `notifyOnNetworkStatusChange: true` keeps previous data visible during refetch, preventing flickering.

---

## Error Handling & Loading States

### Loading State Management

**Pattern**: All queries provide `loading` state from Apollo Client

**Implementation**:
```typescript
const { data, loading, error } = useQuery(QUERY);

if (loading) return <LoadingIndicator />;
if (error) return <ErrorAlert error={error} />;
// Render data
```

**Network Status**: For paginated queries, `networkStatus` from Apollo provides more granular loading states:
- `NetworkStatus.ready`: Data loaded
- `NetworkStatus.refetch`: Refetching in background
- `NetworkStatus.fetchMore`: Loading more pages

### Error Handling

**Global Error Handling**: Configured in Apollo Client setup:
```typescript
const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ extensions }) => {
      if (extensions?.code === 'AUTHENTICATION_ERROR') {
        // Redirect to login
      }
    });
  }
});
```

**Component-Level Error Handling**:
- Display error messages to users
- Provide retry mechanisms
- Log errors for debugging

**Common Error Scenarios**:
1. **Authentication Errors**: Redirect to login page
2. **Network Errors**: Show connection error message
3. **Validation Errors**: Display field-specific errors
4. **Permission Errors**: Show access denied message

### Error Display Components

- `ErrorAlert`: Reusable error display component
- Provides retry functionality via `refetch` callback
- User-friendly error messages
- Styled consistently across application

---

## Best Practices & Troubleshooting

This section provides guidance on best practices for working with the DOPAMS APIs and troubleshooting common issues that developers may encounter.

### Best Practices

#### Query Best Practices

**1. Always Specify Required Fields**

Only request the fields you need. This reduces payload size and improves performance:

```typescript
// ❌ Bad: Fetching all fields
query {
  firs {
    nodes {
      # ... 50+ fields
    }
  }
}

// ✅ Good: Only fetch needed fields
query {
  firs {
    nodes {
      id
      firNumber
      caseStatus
      crimeRegDate
    }
  }
}
```

**2. Use Fragments for Reusable Field Sets**

When the same fields are used in multiple queries, use fragments:

```typescript
const FIR_BASIC_FIELDS = gql`
  fragment FirBasicFields on FirType {
    id
    firNumber
    unit
    ps
    year
    caseStatus
  }
`;

const GET_FIRS = gql`
  query Firs {
    firs {
      nodes {
        ...FirBasicFields
      }
    }
  }
  ${FIR_BASIC_FIELDS}
`;
```

**3. Handle Loading States Appropriately**

Different loading states require different UI treatment:

```typescript
// Initial load - show full loading indicator
if (loading && !data) {
  return <FullPageLoading />;
}

// Background refetch - show subtle indicator
if (networkStatus === NetworkStatus.refetch) {
  return (
    <div>
      <SubtleSpinner />
      <DataTable data={data} />
    </div>
  );
}
```

**4. Use Appropriate Fetch Policies**

Choose the right fetch policy for your use case:

```typescript
// Real-time data - always fetch fresh
useQuery(GET_LIVE_DATA, {
  fetchPolicy: 'network-only',
});

// Static reference data - cache-first
useQuery(GET_REFERENCE_DATA, {
  fetchPolicy: 'cache-first',
});

// Dashboard data - cache and network
useQuery(GET_DASHBOARD_DATA, {
  fetchPolicy: 'cache-and-network',
});
```

#### Mutation Best Practices

**1. Always Handle Errors**

Never ignore errors in mutations:

```typescript
// ❌ Bad: No error handling
const [createUser] = useMutation(CREATE_USER_MUTATION);

// ✅ Good: Comprehensive error handling
const [createUser, { loading, error }] = useMutation(CREATE_USER_MUTATION, {
  onError: (error) => {
    toast.error(`Failed to create user: ${error.message}`);
    logError(error);
  },
});
```

**2. Provide User Feedback**

Always inform users of mutation results:

```typescript
const [updateStatus] = useMutation(UPDATE_STATUS_MUTATION, {
  onCompleted: () => {
    toast.success('Status updated successfully');
  },
  onError: (error) => {
    toast.error('Failed to update status');
  },
});
```

**3. Update Cache After Mutations**

Ensure UI reflects changes immediately:

```typescript
const [uploadFile] = useMutation(UPLOAD_FILE_MUTATION, {
  onCompleted: () => {
    refetch(); // Refresh to show new file
    // OR update cache directly for better performance
  },
});
```

**4. Use Optimistic Updates for Better UX**

Update UI immediately, revert if mutation fails:

```typescript
const [toggleStatus] = useMutation(TOGGLE_STATUS_MUTATION, {
  optimisticResponse: {
    toggleStatus: {
      id: itemId,
      status: newStatus,
    },
  },
});
```

#### Filter Best Practices

**1. Debounce Expensive Filter Queries**

Don't query on every keystroke:

```typescript
const [searchTerm, setSearchTerm] = useState('');
const debouncedSearch = useDebounce(searchTerm, 300);

useQuery(SEARCH_QUERY, {
  variables: { searchTerm: debouncedSearch },
  skip: debouncedSearch.length < 2,
});
```

**2. Clear Filters Properly**

Provide clear filter reset functionality:

```typescript
const handleClearFilters = () => {
  setFilters(INITIAL_FILTERS);
  setPagination(prev => ({ ...prev, pageIndex: 0 }));
};
```

**3. Validate Filter Combinations**

Ensure filters make sense together:

```typescript
useEffect(() => {
  if (filters.selectedDateFrom && filters.selectedDateTo) {
    if (filters.selectedDateFrom > filters.selectedDateTo) {
      toast.error('Start date must be before end date');
      setFilters(prev => ({ ...prev, selectedDateFrom: '' }));
    }
  }
}, [filters]);
```

#### Performance Best Practices

**1. Use Pagination**

Never fetch all records at once:

```typescript
// ❌ Bad: Fetching all records
useQuery(GET_ALL_FIRS); // Could be thousands of records

// ✅ Good: Paginated queries
useQuery(GET_FIRS, {
  variables: { page: 1, limit: 100 },
});
```

**2. Implement Virtual Scrolling for Large Lists**

For very large datasets, use virtual scrolling:

```typescript
import { useVirtualizer } from '@tanstack/react-virtual';

const virtualizer = useVirtualizer({
  count: data?.firs?.nodes.length || 0,
  getScrollElement: () => parentRef.current,
  estimateSize: () => 50,
});
```

**3. Cache Filter Values**

Don't refetch filter values unnecessarily:

```typescript
const { data: filterValues } = useQuery(FILTER_VALUES, {
  fetchPolicy: 'cache-first', // Use cache if available
  staleTime: 5 * 60 * 1000, // Consider fresh for 5 minutes
});
```

**4. Batch Related Queries**

Use `useSuspenseQuery` or batch queries when possible:

```typescript
// Multiple queries can be batched by Apollo Client
const queries = [
  useQuery(GET_FIRS),
  useQuery(GET_ACCUSEDS),
  useQuery(GET_STATS),
];
```

### Troubleshooting Guide

#### Common Issues and Solutions

**Issue 1: Query Not Refetching After Mutation**

**Symptoms:** Data doesn't update after mutation completes.

**Causes:**
- Missing `refetchQueries` in mutation options
- Cache not being updated
- Query variables changed, creating new cache entry

**Solutions:**

```typescript
// Solution 1: Add refetchQueries
const [updateUser] = useMutation(UPDATE_USER_MUTATION, {
  refetchQueries: [{ query: GET_USERS }],
});

// Solution 2: Update cache manually
const [updateUser] = useMutation(UPDATE_USER_MUTATION, {
  update: (cache, { data }) => {
    cache.modify({
      id: cache.identify(data.updateUser),
      fields: {
        // Update fields
      },
    });
  },
});

// Solution 3: Use refetch function
const { refetch } = useQuery(GET_USERS);
const [updateUser] = useMutation(UPDATE_USER_MUTATION, {
  onCompleted: () => refetch(),
});
```

**Issue 2: Filters Not Applying**

**Symptoms:** Filter selections don't affect query results.

**Causes:**
- Filter transformation not working correctly
- Empty arrays being sent (should be omitted)
- Filter variables not updating

**Solutions:**

```typescript
// Check filter transformation
const transformedFilters = useMemo(() => {
  const result = {};
  
  // Only include non-empty arrays
  if (filters.selectedStatus?.length > 0) {
    result.caseStatus = filters.selectedStatus;
  }
  
  // Don't include empty arrays
  // ❌ result.caseStatus = []; // Wrong!
  
  return result;
}, [filters]);

// Verify variables are updating
console.log('Query variables:', {
  page,
  limit,
  filters: transformedFilters,
});
```

**Issue 3: Authentication Errors**

**Symptoms:** Queries fail with authentication errors, even after login.

**Causes:**
- Token expired
- Token not being sent in headers
- Token format incorrect

**Solutions:**

```typescript
// Check token storage
const token = localStorage.getItem('authToken');
console.log('Token:', token);

// Verify token format
// Should be: "Bearer <token>" or just "<token>"

// Check auth link configuration
const authLink = setContext((_, { headers }) => {
  const token = getToken();
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

// Handle token expiration
const errorLink = onError(({ graphQLErrors }) => {
  if (graphQLErrors?.some(e => e.extensions?.code === 'UNAUTHENTICATED')) {
    // Clear token and redirect to login
    localStorage.removeItem('authToken');
    window.location.href = '/login';
  }
});
```

**Issue 4: Pagination Not Working**

**Symptoms:** Pagination controls don't change results, or wrong page shown.

**Causes:**
- Page number calculation incorrect
- Cache not handling pagination correctly
- Pagination state not updating

**Solutions:**

```typescript
// Verify page calculation
const page = pagination.pageIndex + 1; // TanStack Table uses 0-based index

// Check pagination helper configuration
cache: new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        firs: paginationHelper(['filters']), // Include filters in cache key
      },
    },
  },
});

// Verify pagination state updates
const handlePageChange = (newPage: number) => {
  setPagination(prev => ({
    ...prev,
    pageIndex: newPage,
  }));
};
```

**Issue 5: Loading States Not Showing**

**Symptoms:** No loading indicators during queries.

**Causes:**
- `loading` state not being checked
- `notifyOnNetworkStatusChange` not set
- Cache serving data immediately

**Solutions:**

```typescript
// Always check loading state
const { data, loading, networkStatus } = useQuery(GET_FIRS, {
  notifyOnNetworkStatusChange: true, // Important!
});

// Handle different loading states
if (loading && !data) {
  return <FullPageLoading />;
}

if (networkStatus === NetworkStatus.refetch) {
  return (
    <div>
      <SubtleSpinner />
      <DataTable data={data} />
    </div>
  );
}
```

**Issue 6: File Uploads Failing**

**Symptoms:** File upload mutations fail or don't complete.

**Causes:**
- File size too large
- Incorrect file format
- Missing multipart configuration

**Solutions:**

```typescript
// Check file size
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
if (file.size > MAX_FILE_SIZE) {
  toast.error('File too large');
  return;
}

// Verify upload link configuration
import createUploadLink from 'apollo-upload-client/createUploadLink.mjs';

const httpLink = createUploadLink({
  uri: GRAPHQL_ENDPOINT,
});

// Check mutation variables
const [uploadFile] = useMutation(UPLOAD_MUTATION, {
  variables: {
    file: fileObject, // Must be File object, not string
    firId: firId,
  },
});
```

#### Debugging Tips

**1. Use Apollo DevTools**

Install Apollo Client DevTools browser extension to inspect:
- Queries and mutations
- Cache contents
- Network requests
- Performance metrics

**2. Enable Query Logging**

```typescript
const { data, loading, error } = useQuery(GET_FIRS, {
  variables: { page, limit, filters },
  onCompleted: (data) => {
    console.log('Query completed:', data);
  },
  onError: (error) => {
    console.error('Query error:', error);
  },
});
```

**3. Inspect Cache**

```typescript
import { useApolloClient } from '@apollo/client';

const client = useApolloClient();

// Read from cache
const cachedData = client.readQuery({
  query: GET_FIRS,
  variables: { page: 1 },
});

console.log('Cached data:', cachedData);

// Inspect entire cache
console.log('Cache:', client.cache.extract());
```

**4. Network Request Inspection**

Use browser DevTools Network tab to inspect:
- Request payload
- Response data
- Headers (including authorization)
- Response time
- Status codes

**5. GraphQL Query Testing**

Test queries directly using GraphQL Playground or similar tools:
- Verify query syntax
- Test with different variables
- Check response structure
- Debug backend issues

---

## API Reference

---

## Home & Dashboard APIs

### `overallCrimeStats`

**Type:** Query  
**Description:** Retrieves overall crime statistics including total seizures worth, total FIRs, and total accused count for a given date range.

**Parameters:**
- `from` (String, optional): Start date in ISO format (YYYY-MM-DD)
- `to` (String, optional): End date in ISO format (YYYY-MM-DD)

**Returns:**
- `totalSeizuresWorth`: Total value of seizures
- `totalFirs`: Total number of FIRs
- `totalAccused`: Total number of accused persons

**Used in:**
- `routes/home/main/Overview.tsx` - Main dashboard overview card

---

### `caseStatusClassification`

**Type:** Query  
**Description:** Returns case status classification statistics grouped by status type.

**Parameters:**
- `from` (String, optional): Start date
- `to` (String, optional): End date

**Returns:** Array of classification objects with `label` and `value`

**Used in:**
- `routes/home/main/CaseStatus.tsx` - Case status chart on dashboard

---

### `regionalOverview`

**Type:** Query  
**Description:** Provides regional overview statistics showing crime data by unit/region.

**Parameters:**
- `from` (String, optional): Start date
- `to` (String, optional): End date

**Returns:** Array of regional data objects with `unit`, `totalFirs`, `totalAccused`, etc.

**Used in:**
- `routes/home/main/RegionalOverview.tsx` - Regional overview component

---

### `drugData`

**Type:** Query  
**Description:** Retrieves drug-related data for specified drugs within a date range.

**Parameters:**
- `from` (String, optional): Start date
- `to` (String, optional): End date
- `drugNames` (Array of String!, required): List of drug names to query

**Returns:** Array of drug data objects with `label`, `value`, and quantity information

**Used in:**
- `routes/home/seizure-info/DrugData.tsx` - Drug data visualization

---

### `drugCases`

**Type:** Query  
**Description:** Returns drug case statistics grouped by drug type.

**Parameters:**
- `from` (String, optional): Start date
- `to` (String, optional): End date

**Returns:** Array of drug case objects

**Used in:**
- `routes/home/seizure-info/DrugTypes.tsx` - Drug types chart

---

### `caseClassificationUI`

**Type:** Query  
**Description:** Provides case classification statistics for UI display.

**Parameters:**
- `from` (String, optional): Start date
- `to` (String, optional): End date

**Returns:** Array of classification objects

**Used in:**
- `routes/home/fir-info/CaseClassificationUI.tsx` - Case classification chart

---

### `trialCasesClassification`

**Type:** Query  
**Description:** Returns trial cases classification statistics.

**Parameters:**
- `from` (String, optional): Start date
- `to` (String, optional): End date

**Returns:** Array of classification objects

**Used in:**
- `routes/home/fir-info/TrailCasesClassification.tsx` - Trial cases classification

---

### `accusedTypeClassification`

**Type:** Query  
**Description:** Provides accused type classification statistics.

**Parameters:**
- `from` (String, optional): Start date
- `to` (String, optional): End date

**Returns:** Array of classification objects

**Used in:**
- `routes/home/accused-info/AccusedCategory.tsx` - Accused category chart

---

### `domicileClassification`

**Type:** Query  
**Description:** Returns domicile classification statistics for accused persons.

**Parameters:**
- `from` (String, optional): Start date
- `to` (String, optional): End date

**Returns:** Array of classification objects

**Used in:**
- `routes/home/accused-info/DomicileClassification.tsx` - Domicile classification chart

---

### `stipulatedTimeClassification`

**Type:** Query  
**Description:** Provides stipulated time classification for cases.

**Parameters:**
- `from` (String, optional): Start date
- `to` (String, optional): End date

**Returns:** Array of classification objects

**Used in:**
- `routes/home/fir-info/UICasesTimeline.tsx` - UI cases timeline chart

---

### `investigationRelatedInfo`

**Type:** Query  
**Description:** Retrieves investigation-related information and statistics.

**Parameters:**
- `from` (String, optional): Start date
- `to` (String, optional): End date

**Returns:** Investigation-related data object

**Used in:**
- `routes/home/InvestigationRelated.tsx` - Investigation related component

---

### `courtRelatedInfo`

**Type:** Query  
**Description:** Returns court-related information and statistics.

**Parameters:**
- `from` (String, optional): Start date
- `to` (String, optional): End date

**Returns:** Court-related data object

**Used in:**
- `routes/home/CourtRelated.tsx` - Court related component

---

## FIR (First Information Report) APIs

### `firs`

**Type:** Query  
**Description:** Retrieves a paginated list of FIRs with filtering, sorting, and pagination support.

**Parameters:**
- `page` (Int, optional, default: 1): Page number for pagination
- `limit` (Int, optional, default: 10): Number of records per page
- `sortKey` (FirSortByEnumType, optional, default: 'crimeRegDate'): Field to sort by
  - Options: `crimeRegDate`, `firNumber`, `unit`, `ps`, etc.
- `sortOrder` (SortTypeEnumType, optional, default: 'desc'): Sort direction (`asc` or `desc`)
- `filters` (FirFilterInputType, optional): Filter criteria object

**FirFilterInputType Fields:**
- `firNumber` (String): Filter by FIR number
- `crimeType` (String): Filter by crime type
- `name` (String): Filter by accused name
- `relativeName` (String): Filter by relative name
- `dateRange` (StringRangeType): Filter by date range
- `domicile` (DomicileType): Filter by domicile
- `caseStatus` (Array of String): Filter by case status(es)
- `psName` (Array of String): Filter by police station name(s)
- `caseClass` (Array of String): Filter by case class(es)
- `units` (Array of String): Filter by unit(s)
- `accuseds` (Array of String): Filter by accused ID(s)
- `years` (Array of Int): Filter by year(s)
- `drugTypes` (Array of String): Filter by drug type(s)
- `drugQuantityRange` (IntRangeType): Filter by drug quantity range
- `drugWorthRange` (IntRangeType): Filter by drug worth range

**Returns:**
- `nodes`: Array of FIR objects with details
- `pageInfo`: Pagination information (isFirstPage, isLastPage, currentPage, etc.)

**Used in:**
- `routes/case-status/firs/index.tsx` - Main FIRs listing page
- `routes/search-tool/individuals/FIRBasedSearch.tsx` - FIR-based search
- `routes/search-tool/individuals/DrugBasedSearch.tsx` - Drug-based search

---

### `fir`

**Type:** Query  
**Description:** Retrieves detailed information for a specific FIR by ID.

**Parameters:**
- `id` (ID!, required): FIR ID

**Returns:** Complete FIR object with all related data including:
- Basic FIR information (unit, ps, year, firNumber, section, etc.)
- Accused details
- Property details
- MO (Modus Operandi) seizures details
- Chargesheet details
- Disposal details
- Documents
- Interrogation reports

**Used in:**
- `routes/case-status/firs/[id]/index.tsx` - FIR detail page

---

### `firStatistics`

**Type:** Query  
**Description:** Returns statistical summary for FIRs based on filter criteria.

**Parameters:**
- `filters` (FirFilterInputType, optional): Filter criteria (same as `firs` query)

**Returns:** Statistics object with counts and aggregations

**Used in:**
- `routes/crime-stats/firs/FirsStats.tsx` - FIR statistics display

---

### `firsAbstract`

**Type:** Query  
**Description:** Retrieves abstract/summary data for FIRs, typically used for charts and visualizations.

**Parameters:**
- `filters` (FirFilterInputType, optional): Filter criteria

**Returns:** Abstract data object with `years` array and aggregated statistics

**Used in:**
- `routes/crime-stats/firs/FirsAbstract.tsx` - FIR abstract data
- `routes/crime-stats/firs/GenerateGraph.tsx` - Graph generation

---

### `firFilterValues`

**Type:** Query  
**Description:** Returns available filter values for FIR filters, optionally filtered by current filter criteria.

**Parameters:**
- `filters` (FirFilterInputType, optional): Current filter criteria to get filtered values

**Returns:** Object containing arrays of available values for:
- `caseClass`
- `caseStatus`
- `ps`
- `units`
- `years`
- `drugTypes`
- etc.

**Used in:**
- `routes/case-status/firs/filters.tsx` - FIR filters component
- `routes/case-status/cases/filters.tsx` - Cases filters component
- `routes/crime-stats/firs/filters.tsx` - Crime stats FIR filters

---

## Accused & Arrest APIs

### `accuseds`

**Type:** Query  
**Description:** Retrieves a paginated list of accused persons with filtering, sorting, and pagination support.

**Parameters:**
- `page` (Int, optional, default: 1): Page number
- `limit` (Int, optional, default: 10): Records per page
- `sortKey` (AccusedSortByEnumType, optional, default: 'crimeRegDate'): Field to sort by
- `sortOrder` (SortTypeEnumType, optional, default: 'desc'): Sort direction
- `filters` (AccusedFilterInputType, optional): Filter criteria

**AccusedFilterInputType Fields:**
- `name` (String): Filter by name
- `units` (Array of String): Filter by unit(s)
- `years` (Array of Int): Filter by year(s)
- `accuseds` (Array of String): Filter by accused ID(s)
- `drugTypes` (Array of String): Filter by drug type(s)
- `nationality` (Array of String): Filter by nationality(ies)
- `state` (Array of String): Filter by state(s)
- `domicileClass` (Array of String): Filter by domicile class(es)
- `gender` (Array of String): Filter by gender(s)
- `domicile` (DomicileType): Filter by domicile
- `caseStatus` (Array of String): Filter by case status(es)
- `ageRange` (IntRangeType): Filter by age range
- `dateRange` (StringRangeType): Filter by date range
- `ps` (Array of String): Filter by police station(s)
- `caseClass` (Array of String): Filter by case class(es)
- `accusedStatus` (Array of String): Filter by accused status(es)
- `accusedType` (Array of String): Filter by accused type(s)

**Returns:**
- `nodes`: Array of accused objects
- `pageInfo`: Pagination information

**Used in:**
- `routes/case-status/arrests/index.tsx` - Main arrests listing page
- `routes/search-tool/individuals/OffenderBasedSearch.tsx` - Offender-based search

---

### `accused`

**Type:** Query  
**Description:** Retrieves detailed information for a specific accused person by accused ID.

**Parameters:**
- `accusedId` (String!, required): Accused ID

**Returns:** Complete accused object with:
- Personal information (name, age, gender, etc.)
- Physical description
- Address details
- Case information
- Associated FIRs
- Previous involvement cases
- Drug information

**Used in:**
- `routes/case-status/arrests/[id]/index.tsx` - Accused profile detail page

---

### `accusedStatistics`

**Type:** Query  
**Description:** Returns statistical summary for accused persons based on filter criteria.

**Parameters:**
- `filters` (AccusedFilterInputType, optional): Filter criteria

**Returns:** Statistics object with:
- `totalAccused`: Total count
- Other aggregated statistics

**Used in:**
- `routes/crime-stats/arrests/AccusedStats.tsx` - Accused statistics
- `routes/crime-stats/arrests/AccusedFilteredStats.tsx` - Filtered statistics

---

### `accusedAbstract`

**Type:** Query  
**Description:** Retrieves abstract/summary data for accused persons, used for charts and visualizations.

**Parameters:**
- `filters` (AccusedFilterInputType, optional): Filter criteria

**Returns:** Abstract data object with `years` array and aggregated statistics

**Used in:**
- `routes/crime-stats/arrests/ArrestsAbstract.tsx` - Arrests abstract data
- `routes/crime-stats/arrests/GenerateGraph.tsx` - Graph generation

---

### `accusedFilterValues`

**Type:** Query  
**Description:** Returns available filter values for accused filters.

**Parameters:**
- `filters` (AccusedFilterInputType, optional): Current filter criteria

**Returns:** Object containing arrays of available values for:
- `caseClass`
- `caseStatus`
- `accusedStatus`
- `ps`
- `gender`
- `nationality`
- `state`
- `domicile`
- `accusedType`

**Used in:**
- `routes/case-status/arrests/filters.tsx` - Arrests filters component
- `routes/crime-stats/arrests/filters.tsx` - Crime stats arrests filters

---

## Criminal Profile APIs

### `criminalProfiles`

**Type:** Query  
**Description:** Retrieves a paginated list of criminal profiles with filtering and sorting.

**Parameters:**
- `page` (Int, optional, default: 1): Page number
- `limit` (Int, optional, default: 10): Records per page
- `sortKey` (CriminalProfileSortByEnumType, optional, default: 'noOfCrimes'): Field to sort by
- `sortOrder` (SortTypeEnumType, optional, default: 'desc'): Sort direction
- `filters` (CriminalProfilesFilterInputType, optional): Filter criteria
  - `name` (String): Filter by name

**Returns:**
- `nodes`: Array of criminal profile objects
- `pageInfo`: Pagination information

**Used in:**
- `routes/criminal-profile/index.tsx` - Criminal profiles listing page

---

### `criminalProfile`

**Type:** Query  
**Description:** Retrieves detailed information for a specific criminal profile by person ID.

**Parameters:**
- `id` (String!, required): Person ID

**Returns:** Complete criminal profile object with:
- Personal information
- Address details (present and permanent)
- Contact information
- Associated crimes
- Documents
- Identity documents
- Arrest count
- Associated drugs

**Used in:**
- `routes/criminal-profile/[id]/index.tsx` - Criminal profile detail page

---

### `accusedCaseHistory`

**Type:** Query  
**Description:** Retrieves complete case history for an accused person, including deduplicated records across multiple person entries.

**Parameters:**
- `accusedId` (String!, required): Accused ID

**Returns:** Case history object with:
- Deduplication metadata (personFingerprint, matchingStrategy, confidenceLevel)
- Person information
- Statistics (totalCrimes, totalDuplicateRecords)
- Complete crime history array

**Note:** This API uses person deduplication to show all cases even if the person has duplicate records in the system.

**Used in:**
- Currently available but not actively used in UI (see `docs/GRAPHQL_CASE_HISTORY_QUERIES.md` for details)
- The UI currently uses `criminalProfile.crimes` instead

**Documentation:** See `docs/GRAPHQL_CASE_HISTORY_QUERIES.md` for complete usage examples

---

### `personCaseHistory`

**Type:** Query  
**Description:** Retrieves case history for a person by person ID (alternative to `accusedCaseHistory`).

**Parameters:**
- `personId` (String!, required): Person ID

**Returns:** Same structure as `accusedCaseHistory`

**Used in:**
- Available but not currently used in UI

---

### `searchPersonsByName`

**Type:** Query  
**Description:** Searches for persons by name with deduplication support.

**Parameters:**
- `name` (String!, required): Name to search for (supports partial match)

**Returns:** Array of person search result objects with:
- Person fingerprint
- Matching strategy
- Full name, parent name, age, district
- Total crimes count
- Total duplicate records count

**Used in:**
- Available but not currently used in UI

---

## Advanced Search APIs

### `advancedSearch`

**Type:** Query  
**Description:** Performs advanced multi-vertical search across FIRs, accused, and other entities with complex filter criteria.

**Parameters:**
- `page` (Int, optional, default: 1): Page number
- `limit` (Int, optional, default: 10): Records per page
- `sortKey` (AdvancedSearchColumnEnumType, optional, default: 'firDate'): Field to sort by
- `sortOrder` (SortTypeEnumType, optional, default: 'desc'): Sort direction
- `filters` (Array of AdvancedSearchFilterInputType, optional): Array of filter criteria
- `select` (Array of AdvancedSearchColumnEnumType, optional): Fields to select/return

**AdvancedSearchFilterInputType Fields:**
- `field` (AdvancedSearchColumnEnumType, required): Field to filter on
- `operator` (AdvancedSearchOperatorsEnumType, required): Operator (equals, contains, greaterThan, etc.)
- `connector` (AdvancedSearchConnectorsEnumType, optional): Connector (AND, OR) for multiple filters
- `value` (String, required): Filter value
- `value2` (String, optional): Second value for range operators

**Returns:**
- `nodes`: Array of search result objects (can include FIR and accused data)
- `pageInfo`: Pagination information

**Used in:**
- `routes/search-tool/multi-vertical/index.tsx` - Multi-vertical search tool

---

### `fieldAutoComplete`

**Type:** Query  
**Description:** Provides autocomplete suggestions for specific fields in advanced search.

**Parameters:**
- `input` (String!, required): User input string
- `fields` (Array of AdvancedSearchColumnEnumType!, required): Fields to search in

**Returns:** Array of autocomplete result objects with:
- `field`: Field name
- `value`: Suggested value

**Used in:**
- `routes/search-tool/fields.tsx` - Field autocomplete component

---

## Seizures APIs

### `seizuresAbstract`

**Type:** Query  
**Description:** Retrieves abstract/summary data for seizures, used for charts and visualizations.

**Parameters:**
- `filters` (FirFilterInputType, optional): Filter criteria (same as FIR filters)

**Returns:** Abstract data object with `years` array and aggregated statistics

**Used in:**
- `routes/crime-stats/seizures/SeizuresAbstract.tsx` - Seizures abstract data
- `routes/crime-stats/seizures/GenerateGraph.tsx` - Graph generation

---

### `seizureStatistics`

**Type:** Query  
**Description:** Returns statistical summary for seizures based on filter criteria.

**Parameters:**
- `filters` (FirFilterInputType, optional): Filter criteria

**Returns:** Statistics object with counts and aggregations

**Used in:**
- `routes/crime-stats/seizures/SeizuresStats.tsx` - Seizures statistics

---

### `seizuresFilterValues`

**Type:** Query  
**Description:** Returns available filter values for seizure filters.

**Parameters:**
- `filters` (FirFilterInputType, optional): Current filter criteria

**Returns:** Object containing arrays of available values for:
- `drugTypes`
- `years`
- `ps`
- `units`
- etc.

**Used in:**
- `routes/crime-stats/seizures/filters.tsx` - Seizures filters component
- `routes/home/seizure-info/DrugData.tsx` - Drug options dropdown

---

## User Management APIs

### `users`

**Type:** Query  
**Description:** Retrieves a paginated list of users with sorting support.

**Parameters:**
- `page` (Int, optional, default: 1): Page number
- `limit` (Int, optional, default: 10): Records per page
- `sortKey` (UserSortByEnumType, optional, default: 'createdAt'): Field to sort by
- `sortOrder` (SortTypeEnumType, optional, default: 'desc'): Sort direction
- `filters` (UserFilterInputType, optional): Filter criteria

**Returns:**
- `nodes`: Array of user objects
- `pageInfo`: Pagination information

**Used in:**
- `routes/users/index.tsx` - Users listing page

---

### `user`

**Type:** Query  
**Description:** Retrieves detailed information for a specific user by ID.

**Parameters:**
- `id` (ID!, required): User ID

**Returns:** User object with:
- `id`, `email`, `status`, `role`
- `backgroundColor` (for UI theme)
- `createdAt`, `updatedAt`

**Used in:**
- `routes/users/[Id]/index.tsx` - User detail page
- `routes/users/Profile.tsx` - User profile component

---

### `login`

**Type:** Mutation  
**Description:** Authenticates a user and returns a JWT token.

**Parameters:**
- `email` (String!, required): User email
- `password` (String!, required): User password

**Returns:**
- `token`: JWT authentication token
- `user`: User object with basic information

**Used in:**
- `routes/login/index.tsx` - Login page

---

### `createUser`

**Type:** Mutation  
**Description:** Creates a new user account (admin only).

**Parameters:**
- `email` (String!, required): User email
- `password` (String!, required): User password
- `role` (UserRoleEnumType, required): User role (e.g., ADMIN, USER)

**Returns:** Created user object

**Used in:**
- `routes/users/CreateUserDialogButton.tsx` - Create user dialog

---

### `updateUserRole`

**Type:** Mutation  
**Description:** Updates the role of a user.

**Parameters:**
- `id` (ID!, required): User ID
- `role` (UserRoleEnumType, required): New role

**Returns:** Updated user object with new role

**Used in:**
- `routes/users/[Id]/UpdateUserRole.tsx` - Update user role component

---

### `updateUserStatus`

**Type:** Mutation  
**Description:** Updates the status of a user (active/inactive).

**Parameters:**
- `id` (ID!, required): User ID
- `status` (UserStatusEnumType, required): New status

**Returns:** Updated user object with new status

**Used in:**
- `routes/users/[Id]/UpdateUserStatus.tsx` - Update user status component

---

### `updateUserBackgroundColor`

**Type:** Mutation  
**Description:** Updates the background color preference for a user (UI theme customization).

**Parameters:**
- `id` (ID!, required): User ID
- `backgroundColor` (String!, required): Hex color code

**Returns:** Updated user object with new backgroundColor

**Used in:**
- `components/ThemeCustomizer.tsx` - Theme customization component

---

## File Upload APIs

### `uploadFirFile`

**Type:** Mutation  
**Description:** Uploads a file/document associated with a specific FIR.

**Parameters:**
- `file` (Upload!, required): File to upload (multipart/form-data)
- `firId` (ID!, required): FIR ID to associate the file with

**Returns:** File upload confirmation string

**Used in:**
- `routes/case-status/firs/[id]/UploadFilesDialog.tsx` - FIR file upload dialog

---

### `uploadCriminalProfileFile`

**Type:** Mutation  
**Description:** Uploads a file/document associated with a criminal profile.

**Parameters:**
- `file` (Upload!, required): File to upload
- `id` (ID!, required): Criminal profile ID

**Returns:** File upload confirmation string

**Used in:**
- `routes/criminal-profile/[id]/UploadFileDialog.tsx` - Criminal profile file upload dialog

---

## Criminal Network APIs

### `criminalNetworkDetails`

**Type:** Query  
**Description:** Retrieves criminal network visualization data showing relationships between persons and crimes.

**Parameters:**
- `personId` (String!, required): Person ID to get network details for

**Returns:** Network person object with:
- Person information
- Associated crimes
- Related persons (with their crimes and relationships)
- Network structure for visualization

**Used in:**
- `routes/criminal-network/[personId]/index.tsx` - Criminal network visualization page

---

## Common Types & Enums

### SortTypeEnumType
- `asc`: Ascending order
- `desc`: Descending order

### DomicileType
- Object with `state` and `district` fields

### StringRangeType
- Object with `from` and `to` string fields

### IntRangeType
- Object with `from` and `to` integer fields

### UserRoleEnumType
- `ADMIN`: Administrator role
- `USER`: Regular user role
- (Other roles as defined in schema)

### UserStatusEnumType
- `ACTIVE`: Active user
- `INACTIVE`: Inactive user
- (Other statuses as defined in schema)

---

## Notes

1. **Date Format:** All date parameters should be in ISO format (YYYY-MM-DD) or as strings that can be parsed.

2. **Pagination:** Most list queries support pagination with `page` and `limit` parameters. The response includes `pageInfo` with pagination metadata.

3. **Filtering:** Filter objects are optional but when provided, they combine with AND logic unless specified otherwise in the filter structure.

4. **Authentication:** Most queries require a valid JWT token in the Authorization header. Only `login` and `signup` mutations are public.

5. **File Uploads:** File upload mutations use GraphQL multipart request specification for handling file uploads.

6. **Error Handling:** All queries and mutations may return GraphQL errors. Check the `errors` field in the response for error details.

---

## Additional Resources

- **Case History Queries:** See `docs/GRAPHQL_CASE_HISTORY_QUERIES.md` for detailed documentation on case history APIs
- **Backend Schema:** See `src/schema/` directory for complete GraphQL schema definitions
- **Frontend Usage:** See `dopams-narco/src/routes/` for React component implementations

---

**Last Updated:** February 2026  
**Version:** 1.0
