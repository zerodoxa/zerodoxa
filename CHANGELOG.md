# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-07-07

### Added
- Complete server-side API routes for **Merge PDF** (`/api/pdf/merge`) and **Split PDF** (`/api/pdf/split`) utilizing `pdf-lib` and `jszip` to compress multiple pages.
- Dynamic mapping and verification checks for `qpdf` permission restrictions during PDF encryption.
- Robust error message extraction in `protectUnlockService.ts` to convert qpdf CLI failures (e.g. invalid password) into user-facing `"Invalid password"` error responses instead of `"Unknown error"`.
- Programmatic end-to-end integration and verification suite (`full-verification.mjs`).

### Fixed
- Fixed ESLint / TypeScript type check compilation errors by converting raw bytes to `Buffer` and casting `NextResponse` parameters appropriately.
- Fixed an ESLint type check error in `EcosystemCard.tsx` relating to explicit `any` usage.
- Fixed temporary directory cleanup bug: files and upload subdirectories are now segmented per request (`pdfmedic-uploads-[UUID]`) to ensure concurrent operations do not clean up/delete other concurrent users' files.
