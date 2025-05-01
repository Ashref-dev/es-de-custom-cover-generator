# ESDE Custom Cover Generator - Next.js Implementation Plan (Client-Side)

This document outlines the steps to create a Next.js web application for generating the Emulation Station Desktop Edition (ESDE) media folder structure **entirely on the client-side**.

**Goal:** Allow users to upload various media files, specify a ROM name and console, and have the browser generate and download a correctly structured zip file using JavaScript.

## 1. Project Structure & Setup

- [x] Create `components/` directory.
- [x] Create `lib/` directory.
- [x] Create `lib/constants.ts` file.
- [x] Create `lib/types.ts` file.
- [x] Install client-side `jszip`: `npm install jszip @types/jszip` or `yarn add jszip @types/jszip`.

## 2. Frontend Development (`app/page.tsx` & `components/`)

### 2.1 UI Components (`components/`)
- [x] Create `FileUploadDropzone.tsx` component (consider using `react-dropzone` or the Aceternity UI component).
    - [x] Implement file selection/drop logic.
    - [x] Implement file type filtering (`accept` prop).
    - [x] Implement display of selected file name/preview (optional).
- [x] Create `ConsoleSelector.tsx` component.
    - [x] Implement dropdown/select element.
    - [x] Populate options from `lib/constants.ts`.
    - [x] Pass selected value back via props (`onChange`).
- [x] Create `SubmitButton.tsx` component.
    - [x] Implement button element.
    - [x] Handle pending/disabled state based on props.

### 2.2 Main Page (`app/page.tsx`) and MediaGenerator (Client Component)
- [x] Keep `app/page.tsx` as a Server Component for better SEO.
- [x] Create `MediaGenerator.tsx` as a Client Component (`'use client';`).
- [x] Import `JSZip` from 'jszip'.
- [x] Implement state management (`useState`):
    - [x] State for ROM Name (`string`).
    - [x] State for Selected Console (`string`).
    - [x] State for each uploaded media file (`File | null`).
    - [x] State for loading/pending status (`boolean`).
    - [x] State for error messages (`string | null`).
- [x] Implement UI Layout:
    - [x] Add text input for ROM Name, bind to state.
    - [x] Add `ConsoleSelector` component, bind to state.
    - [x] Add `FileUploadDropzone` components for each media type (`covers`, `marquees`, etc.), bind to state.
    - [x] Configure `accept` props for each `FileUploadDropzone`.
    - [x] Add `SubmitButton` component, pass pending state.
- [x] Implement Client-Side Validation:
    - [x] Check if ROM Name and Console are selected before submission.
    - [x] Display validation errors.
- [x] Implement Client-Side Zip Generation Logic (e.g., in a button's `onClick` handler):
    - [x] Set pending state to `true`.
    - [x] Clear previous errors.
    - [x] Perform validation checks (ROM Name, Console selected).
        - [x] If invalid, set error state and set pending to `false`.
    - [x] Initialize `JSZip`: `const zip = new JSZip();`.
    - [x] Get the selected `consoleName` from state.
    - [x] Get the entered `romName` from state.
    - [x] Define or import media types configuration from `lib/constants.ts`.
    - [x] Create the root console folder: `const consoleFolder = zip.folder(consoleName);`.
    - [x] Iterate through the media types configuration:
        - [x] Get the corresponding `File` object from state.
        - [x] If the `File` object exists:
            - [x] Get the media type folder name (e.g., `covers`).
            - [x] Ensure the media type folder exists: `const mediaFolder = consoleFolder!.folder(mediaTypeFolderName);` (Use non-null assertion `!` or check if `consoleFolder` is null).
            - [x] Determine the target extension (`.jpg`, `.png`, `.mp4`).
            - [x] Construct the target filename: `${romName}.${extension}`.
            - [x] Add the file to the zip using its `File` object: `mediaFolder!.file(targetFilename, uploadedFile);` (`jszip` can handle `File` objects directly).
    - [x] Generate the zip file as a Blob: `const zipBlob = await zip.generateAsync({ type: 'blob' });`.
    - [x] Trigger Download:
        - [x] Create object URL: `const url = URL.createObjectURL(zipBlob);`
        - [x] Create a temporary link element (`<a>`).
        - [x] Set `href` to the object URL.
        - [x] Set `download` attribute to the desired filename (e.g., `${consoleName}_${romName}_media.zip`).
        - [x] Programmatically click the link.
        - [x] Revoke the object URL: `URL.revokeObjectURL(url);`
    - [x] Set pending state to `false`.
    - [x] Handle potential errors during zipping (wrap `zip.generateAsync` in `try...catch`) and set error state.

## 3. Constants and Types

- [x] Define `MediaType` configuration in `lib/constants.ts` (e.g., `[{ key: 'covers', folder: 'covers', extension: '.jpg', accept: 'image/jpeg' }, ...]`). Include the `key` used for state management.
- [x] Define allowed console names in `lib/constants.ts` (e.g., `['ps3', 'gba', 'nes', ...]`).
- [x] Define any necessary local types in `lib/types.ts` (e.g., for component props, though `ServerActionResult` is removed).

## 4. Styling & Refinement

- [x] Apply base styles (e.g., using Tailwind CSS global styles).
- [x] Style the `FileUploadDropzone` component.
    - [x] Add visual feedback for drag-over state.
    - [x] Style the display of the selected file.
- [x] Style the `ConsoleSelector` component.
- [x] Style the `SubmitButton` component.
    - [x] Add styles for pending/disabled state.
- [x] Style the main page layout (`app/page.tsx`).
- [x] Implement loading indicators (e.g., spinner) shown when pending state is true.
- [x] Implement clear display for error messages.

