import { locations } from "./locations"

export const locationsWithImages = locations.map((location) => {
  const basePath = "/assets/images/locations"
  switch (location.slug) {
    case "cancun":
      return { ...location, imageUrl: `${basePath}/cancun.jpg` }
    case "dubai":
      return { ...location, imageUrl: `${basePath}/dubai.jpg` }
    case "paris":
      return { ...location, imageUrl: `${basePath}/paris.jpg` }
    case "rio":
      return { ...location, imageUrl: `${basePath}/rio.jpg` }
    case "rome":
      return { ...location, imageUrl: `${basePath}/rome.jpg` }
    case "sydney":
      return { ...location, imageUrl: `${basePath}/sydney.jpg` }
    default:
      return location
  }
})
