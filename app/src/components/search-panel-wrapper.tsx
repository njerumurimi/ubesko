import {
  useQuery,
  getLocations
} from 'wasp/client/operations';
import { SearchPanel } from "./search-panel"

export function SearchPanelWrapper(props: any) {
  const { data: locations, isLoading, error } = useQuery(getLocations)

  if (!locations) return null

  return <SearchPanel locations={locations} {...props} />
}
