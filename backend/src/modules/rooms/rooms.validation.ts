/**
 * FILE: src/modules/rooms/rooms.validation.ts
 * PURPOSE: Input validation for all room operations
 *
 * WHAT IT DOES:
 * - validateCreateRoomInput() - Validates room type creation
 * - validateUpdateRoomInput() - Validates room type updates
 * - validateRoomId() - Validates room ID format
 * - validateApprovalStatus() - Validates room approval status
 *
 * USAGE:
 * import { validateCreateRoomInput } from './rooms.validation';
 * const { isValid, errors } = validateCreateRoomInput(roomData);
 */

/**
 * Validates room type creation input
 *
 * REQUIRED FIELDS:
 * - room_type (string, 2+ chars, max 150)
 *
 * OPTIONAL FIELDS:
 * - description (string, max 5000 chars)
 * - base_price (number, required, must be > 0)
 * - room_size (string, max 50 chars)
 *
 * @param {any} roomData - Room data object
 * @returns {object} { isValid: boolean, errors: string[] }
 *
 * @example
 * const result = validateCreateRoomInput({
 *   room_type: "Deluxe Double",
 *   base_price: 150.50,
 *   description: "Spacious room with queen bed",
 *   room_size: "40m²"
 * });
 * if (!result.isValid) {
 *   console.log(result.errors);
 * }
 */
export function validateCreateRoomInput(roomData: any) {
  const errors: string[] = [];

  // Validate room_type (required)
  if (!roomData.room_type) {
    errors.push("room_type is required");
  } else if (typeof roomData.room_type !== "string") {
    errors.push("room_type must be a string");
  } else if (roomData.room_type.trim().length < 2) {
    errors.push("room_type must be at least 2 characters");
  } else if (roomData.room_type.length > 150) {
    errors.push("room_type cannot exceed 150 characters");
  }

  // Validate base_price (required)
  if (roomData.base_price === undefined || roomData.base_price === null) {
    errors.push("base_price is required");
  } else {
    const price = parseFloat(roomData.base_price);
    if (isNaN(price)) {
      errors.push("base_price must be a valid number");
    } else if (price <= 0) {
      errors.push("base_price must be greater than 0");
    } else if (price > 999999.99) {
      errors.push("base_price cannot exceed 999999.99");
    }
  }

  // Validate description (optional)
  if (roomData.description !== undefined && roomData.description !== null) {
    if (typeof roomData.description !== "string") {
      errors.push("description must be a string");
    } else if (roomData.description.length > 5000) {
      errors.push("description cannot exceed 5000 characters");
    }
  }

  // Validate room_size (optional)
  if (roomData.room_size !== undefined && roomData.room_size !== null) {
    if (typeof roomData.room_size !== "string") {
      errors.push("room_size must be a string");
    } else if (roomData.room_size.length > 50) {
      errors.push("room_size cannot exceed 50 characters");
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validates room type update input
 *
 * CONSTRAINTS:
 * - All fields optional
 * - At least one field required for update
 * - Same validation rules as create for each field
 *
 * @param {any} roomData - Partial room data object
 * @returns {object} { isValid: boolean, errors: string[] }
 *
 * @example
 * const result = validateUpdateRoomInput({
 *   base_price: 175.00
 * });
 * if (!result.isValid) {
 *   console.log(result.errors);
 * }
 */
export function validateUpdateRoomInput(roomData: any) {
  const errors: string[] = [];

  // Check at least one field is provided
  const hasField =
    roomData.room_type !== undefined ||
    roomData.description !== undefined ||
    roomData.base_price !== undefined ||
    roomData.room_size !== undefined ||
    roomData.amenities !== undefined ||
    roomData.images !== undefined;

  if (!hasField) {
    errors.push("At least one field is required for update");
    return { isValid: false, errors };
  }

  // Validate room_type (optional)
  if (roomData.room_type !== undefined && roomData.room_type !== null) {
    if (typeof roomData.room_type !== "string") {
      errors.push("room_type must be a string");
    } else if (roomData.room_type.trim().length < 2) {
      errors.push("room_type must be at least 2 characters");
    } else if (roomData.room_type.length > 150) {
      errors.push("room_type cannot exceed 150 characters");
    }
  }

  // Validate base_price (optional)
  if (roomData.base_price !== undefined && roomData.base_price !== null) {
    const price = parseFloat(roomData.base_price);
    if (isNaN(price)) {
      errors.push("base_price must be a valid number");
    } else if (price <= 0) {
      errors.push("base_price must be greater than 0");
    } else if (price > 999999.99) {
      errors.push("base_price cannot exceed 999999.99");
    }
  }

  // Validate description (optional)
  if (roomData.description !== undefined && roomData.description !== null) {
    if (typeof roomData.description !== "string") {
      errors.push("description must be a string");
    } else if (roomData.description.length > 5000) {
      errors.push("description cannot exceed 5000 characters");
    }
  }

  // Validate room_size (optional)
  if (roomData.room_size !== undefined && roomData.room_size !== null) {
    if (typeof roomData.room_size !== "string") {
      errors.push("room_size must be a string");
    } else if (roomData.room_size.length > 50) {
      errors.push("room_size cannot exceed 50 characters");
    }
  }

  // Validate amenities (optional)
  if (roomData.amenities !== undefined && roomData.amenities !== null) {
    if (!Array.isArray(roomData.amenities)) {
      errors.push("amenities must be an array");
    } else {
      roomData.amenities.forEach((amenity: any, index: number) => {
        // Allow both strings and numbers
        if (typeof amenity === 'string') {
          const amenityId = parseInt(amenity, 10);
          if (isNaN(amenityId) || amenityId <= 0) {
            errors.push(`amenities[${index}] must be a valid positive number`);
          }
        } else if (typeof amenity === 'number') {
          if (amenity <= 0 || !Number.isInteger(amenity)) {
            errors.push(`amenities[${index}] must be a valid positive integer`);
          }
        } else {
          errors.push(`amenities[${index}] must be a string or number`);
        }
      });
    }
  }

  // Validate images (optional)
  if (roomData.images !== undefined && roomData.images !== null) {
    if (!Array.isArray(roomData.images)) {
      errors.push("images must be an array");
    } else {
      // Allow empty array (user might want to delete all images)
      for (let i = 0; i < roomData.images.length; i++) {
        const image = roomData.images[i];
        
        // Support both string format (legacy) and object format (new)
        if (typeof image === "string") {
          // Legacy format: just URL
          if (image.trim().length === 0) {
            errors.push(`images[${i}] cannot be empty`);
          }
        } else if (typeof image === "object" && image !== null) {
          // New format: { image_url, is_cover? }
          if (!image.image_url || typeof image.image_url !== "string") {
            errors.push(`images[${i}] must have a valid image_url string`);
          }
          if (image.image_url && image.image_url.trim().length === 0) {
            errors.push(`images[${i}] image_url cannot be empty`);
          }
          if (image.is_cover !== undefined && typeof image.is_cover !== "boolean") {
            errors.push(`images[${i}] is_cover must be a boolean`);
          }
        } else {
          errors.push(`images[${i}] must be a string or object with image_url`);
        }
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validates room ID format
 *
 * CONSTRAINTS:
 * - Must be a number
 * - Must be greater than 0
 *
 * @param {any} roomId - Room ID value
 * @returns {object} { isValid: boolean, errors: string[] }
 *
 * @example
 * const result = validateRoomId(123);
 * if (!result.isValid) {
 *   console.log(result.errors);
 * }
 */
export function validateRoomId(roomId: any) {
  const errors: string[] = [];

  if (roomId === undefined || roomId === null) {
    errors.push("Room ID is required");
  } else if (typeof roomId !== "number" || !Number.isInteger(roomId)) {
    errors.push("Room ID must be an integer");
  } else if (roomId <= 0) {
    errors.push("Room ID must be greater than 0");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validates room approval status
 *
 * ALLOWED VALUES:
 * - PENDING
 * - APPROVED
 * - REJECTED
 *
 * @param {any} status - Approval status value
 * @returns {object} { isValid: boolean, errors: string[] }
 *
 * @example
 * const result = validateApprovalStatus("APPROVED");
 * if (!result.isValid) {
 *   console.log(result.errors);
 * }
 */
export function validateApprovalStatus(status: any) {
  const errors: string[] = [];
  const allowedStatuses = ["PENDING", "APPROVED", "REJECTED"];

  if (!status) {
    errors.push("Approval status is required");
  } else if (typeof status !== "string") {
    errors.push("Approval status must be a string");
  } else if (!allowedStatuses.includes(status.toUpperCase())) {
    errors.push(`Approval status must be one of: ${allowedStatuses.join(", ")}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validates physical room creation input
 *
 * REQUIRED FIELDS:
 * - room_number (string, 2+ chars, max 50)
 *
 * OPTIONAL FIELDS:
 * - bed_type (string, max 50)
 * - max_occupancy (number, 1-20)
 * - smoking_allowed (boolean)
 * - pet_allowed (boolean)
 * - image_url (string, max 500)
 *
 * @param {any} roomDetail - Physical room detail object
 * @returns {object} { isValid: boolean, errors: string[] }
 *
 * @example
 * const result = validatePhysicalRoomInput({
 *   room_number: "101",
 *   bed_type: "Queen",
 *   max_occupancy: 2
 * });
 */
export function validatePhysicalRoomInput(roomDetail: any) {
  const errors: string[] = [];

  // Validate room_number (required)
  if (!roomDetail.room_number) {
    errors.push("room_number is required");
  } else if (typeof roomDetail.room_number !== "string") {
    errors.push("room_number must be a string");
  } else if (roomDetail.room_number.trim().length < 1) {
    errors.push("room_number cannot be empty");
  } else if (roomDetail.room_number.length > 50) {
    errors.push("room_number cannot exceed 50 characters");
  }

  // Validate bed_type (optional)
  if (roomDetail.bed_type !== undefined && roomDetail.bed_type !== null) {
    if (typeof roomDetail.bed_type !== "string") {
      errors.push("bed_type must be a string");
    } else if (roomDetail.bed_type.length > 50) {
      errors.push("bed_type cannot exceed 50 characters");
    }
  }

  // Validate max_occupancy (optional)
  if (roomDetail.max_occupancy !== undefined && roomDetail.max_occupancy !== null) {
    const occupancy = parseInt(roomDetail.max_occupancy, 10);
    if (isNaN(occupancy)) {
      errors.push("max_occupancy must be a valid number");
    } else if (occupancy < 1 || occupancy > 20) {
      errors.push("max_occupancy must be between 1 and 20");
    }
  }

  // Validate smoking_allowed (optional)
  if (roomDetail.smoking_allowed !== undefined && roomDetail.smoking_allowed !== null) {
    if (typeof roomDetail.smoking_allowed !== "boolean") {
      errors.push("smoking_allowed must be a boolean");
    }
  }

  // Validate pet_allowed (optional)
  if (roomDetail.pet_allowed !== undefined && roomDetail.pet_allowed !== null) {
    if (typeof roomDetail.pet_allowed !== "boolean") {
      errors.push("pet_allowed must be a boolean");
    }
  }

  // Validate image_url (optional)
  if (roomDetail.image_url !== undefined && roomDetail.image_url !== null) {
    if (typeof roomDetail.image_url !== "string") {
      errors.push("image_url must be a string");
    } else if (roomDetail.image_url.length > 500) {
      errors.push("image_url cannot exceed 500 characters");
    }
  }

  // Validate status (optional, defaults to AVAILABLE)
  if (roomDetail.status !== undefined && roomDetail.status !== null) {
    const validStatuses = ["AVAILABLE", "UNAVAILABLE", "MAINTENANCE"];
    if (!validStatuses.includes(roomDetail.status)) {
      errors.push(`status must be one of: ${validStatuses.join(", ")}`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validates bulk physical room creation input
 *
 * CONSTRAINTS:
 * - room_numbers must be an array
 * - Must have 1+ items (min 1, max 100)
 * - Each item validated with validatePhysicalRoomInput()
 * - All room_numbers must be unique
 *
 * @param {any[]} roomNumbers - Array of physical room details
 * @returns {object} { isValid: boolean, errors: string[] }
 *
 * @example
 * const result = validateBulkPhysicalRoomsInput([
 *   { room_number: "101", bed_type: "Queen", max_occupancy: 2 },
 *   { room_number: "102", bed_type: "Queen", max_occupancy: 2 }
 * ]);
 */
export function validateBulkPhysicalRoomsInput(roomNumbers: any) {
  const errors: string[] = [];

  // Validate is array
  if (!Array.isArray(roomNumbers)) {
    errors.push("room_numbers must be an array");
    return { isValid: false, errors };
  }

  // Validate count
  if (roomNumbers.length === 0) {
    errors.push("At least 1 room is required");
    return { isValid: false, errors };
  }

  if (roomNumbers.length > 100) {
    errors.push("Cannot add more than 100 rooms at once");
    return { isValid: false, errors };
  }

  // Check for duplicate room numbers
  const roomNums = roomNumbers.map((r) => r.room_number);
  const uniqueRoomNums = new Set(roomNums);
  if (uniqueRoomNums.size !== roomNums.length) {
    errors.push("Duplicate room numbers found");
    return { isValid: false, errors };
  }

  // Validate each room
  roomNumbers.forEach((room, index) => {
    const validation = validatePhysicalRoomInput(room);
    if (!validation.isValid) {
      validation.errors.forEach((err) => {
        errors.push(`Room ${index + 1}: ${err}`);
      });
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validates room with physical rooms bulk creation input
 *
 * REQUIRES:
 * - roomData: valid room type data (validated with validateCreateRoomInput)
 * - roomNumbers: valid bulk physical rooms data (validated with validateBulkPhysicalRoomsInput)
 *
 * @param {any} roomData - Room type data
 * @param {any[]} roomNumbers - Array of physical room details
 * @returns {object} { isValid: boolean, errors: string[] }
 *
 * @example
 * const result = validateCreateRoomWithPhysicalRooms(
 *   {
 *     room_type: "Deluxe Double",
 *     base_price: 150.50,
 *     description: "Spacious room with queen bed"
 *   },
 *   [
 *     { room_number: "101", bed_type: "Queen" },
 *     { room_number: "102", bed_type: "Queen" }
 *   ]
 * );
 */
export function validateCreateRoomWithPhysicalRooms(roomData: any, roomNumbers: any) {
  const errors: string[] = [];

  // Validate room type data
  const roomValidation = validateCreateRoomInput(roomData);
  if (!roomValidation.isValid) {
    errors.push(...roomValidation.errors);
  }

  // Validate physical rooms data
  const physicalValidation = validateBulkPhysicalRoomsInput(roomNumbers);
  if (!physicalValidation.isValid) {
    errors.push(...physicalValidation.errors);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
