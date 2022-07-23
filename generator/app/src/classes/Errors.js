const StatusSafeErrorType = {
  UNKNOWN: "",
  INSUFFICENT_FUNDS: "INSUFFICENT_FUNDS",
  SYNC_FAIL: "SYNC_FAIL",
  RECORD_NOT_FOUND: "RECORD_NOT_FOUND",
  RECORD_NOT_UNIQUE: "RECORD_NOT_UNIQUE",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  PROCESS_ERROR: "PROCESS_ERROR",
  INSUFFICENT_PERMISSIONS: "INSUFFICENT_PERMISSIONS",
  INVALID_ACTION: "INVALID_ACTION",
  CONNECTION_ERROR: "CONNECTION_ERROR"
};

class StatusSafeError extends Error {
  constructor(message, type = StatusSafeErrorType.UNKNOWN) {
    super(message);
    this.name = "StatusSafeError";
    this.type = type;
  }
}

module.exports = {
  StatusSafeError,
  StatusSafeErrorType
};