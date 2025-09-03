import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

interface FiltersState {
  location: string
  subLocation: string
  guests: string
  price: string
  amenities: string[]
  outdoor: string[]
  activities: string[]
}

const initialState: FiltersState = {
  location: "",
  subLocation: "",
  guests: "",
  price: "",
  amenities: [],
  outdoor: [],
  activities: [],
}

const filtersSlice = createSlice({
  name: "filters",
  initialState,
  reducers: {
    setLocation: (state, action: PayloadAction<string>) => {
      state.location = action.payload
    },
    setSubLocation: (state, action: PayloadAction<string>) => {
      state.subLocation = action.payload
    },
    setGuests: (state, action: PayloadAction<string>) => {
      state.guests = action.payload
    },
    setPrice: (state, action: PayloadAction<string>) => {
      state.price = action.payload
    },
    toggleAmenity: (state, action: PayloadAction<string>) => {
      const amenity = action.payload
      if (state.amenities.includes(amenity)) {
        state.amenities = state.amenities.filter((a) => a !== amenity)
      } else {
        state.amenities.push(amenity)
      }
    },
    toggleOutdoor: (state, action: PayloadAction<string>) => {
      const outdoor = action.payload
      if (state.outdoor.includes(outdoor)) {
        state.outdoor = state.outdoor.filter((o) => o !== outdoor)
      } else {
        state.outdoor.push(outdoor)
      }
    },
    toggleActivity: (state, action: PayloadAction<string>) => {
      const activity = action.payload
      if (state.activities.includes(activity)) {
        state.activities = state.activities.filter((a) => a !== activity)
      } else {
        state.activities.push(activity)
      }
    },
    clearFilters: () => {
      return initialState
    },
  },
})

export const {
  setLocation,
  setSubLocation,
  setGuests,
  setPrice,
  toggleAmenity,
  toggleOutdoor,
  toggleActivity,
  clearFilters,
} = filtersSlice.actions

export default filtersSlice.reducer
