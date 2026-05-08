# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a minimal Rust learning project with a simple "Hello, world!" starter program. The `Cargo.toml` uses edition = "2024" (note: Rust editions are typically 2015, 2018, 2021 - verify this is intentional).

## Commands

```bash
cargo build        # Build the project
cargo run          # Run the project
cargo test         # Run tests
cargo check        # Check code for errors without building
cargo build --release  # Build with optimizations
```

## Architecture

A single-file Rust project with `src/main.rs` as the entry point. Add modules under `src/` and reference them in `main.rs` as the project grows.
