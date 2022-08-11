# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## 2.1.0 - 2022-08-11

## Added

- pagination support for agents

## 2.0.4 - 2022-08-04

## Fixed

- wazuh client for agent and manager routes

## Added

- better error handling
- tests for agent and manager steps
- recordings against an real wazuh server
- sanitization logic for said recordings

## 2.0.3 - 2022-07-18

## Fixed

- clear setInterval to refresh JWT token if auth fails

## 2.0.2 - 2022-07-18

- bump

## 2.0.1 - 2022-07-15

### Changed

- fix auth (blind, still need to test in dev)

## 2.0.0 - 2022-04-25

### Changed

- Updated to use `@jupiterone/integration-sdk-*` version 8
- Updated project to match patterns in `integration-template`
