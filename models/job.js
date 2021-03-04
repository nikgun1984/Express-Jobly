"use strict";

// NOTE/OBSERVATION: "equity" column uses NUMERIC type due to possible precision loss
// another problem will arise when we query this value but we should use
// library pg. The value that is returted from querying is a string due to the
// fact again to keep precision especially in financial data.
