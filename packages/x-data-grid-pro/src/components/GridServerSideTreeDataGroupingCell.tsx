import * as React from 'react';
import { unstable_composeClasses as composeClasses } from '@mui/utils';
import Box from '@mui/material/Box';
import Badge from '@mui/material/Badge';
import {
  getDataGridUtilityClass,
  GridRenderCellParams,
  GridServerSideGroupNode,
  useGridSelector,
} from '@mui/x-data-grid';
import CircularProgress from '@mui/material/CircularProgress';
import { useGridRootProps } from '../hooks/utils/useGridRootProps';
import { useGridPrivateApiContext } from '../hooks/utils/useGridPrivateApiContext';
import { DataGridProProcessedProps } from '../models/dataGridProProps';
import { GridPrivateApiPro } from '../models/gridApiPro';
import { GridStatePro } from '../models/gridStatePro';

type OwnerState = DataGridProProcessedProps;

const useUtilityClasses = (ownerState: OwnerState) => {
  const { classes } = ownerState;

  const slots = {
    root: ['treeDataGroupingCell'],
    toggle: ['treeDataGroupingCellToggle'],
    loadingContainer: ['treeDataGroupingCellLoadingContainer'],
  };

  return composeClasses(slots, getDataGridUtilityClass, classes);
};

interface GridTreeDataGroupingCellProps
  extends GridRenderCellParams<any, any, any, GridServerSideGroupNode> {
  hideDescendantCount?: boolean;
  /**
   * The cell offset multiplier used for calculating cell offset (`rowNode.depth * offsetMultiplier` px).
   * @default 2
   */
  offsetMultiplier?: number;
}

interface GridTreeDataGroupingCellIconProps
  extends Pick<GridTreeDataGroupingCellProps, 'id' | 'field' | 'rowNode' | 'row'> {
  descendantCount: number;
}

function GridTreeDataGroupingCellIcon(props: GridTreeDataGroupingCellIconProps) {
  const apiRef = useGridPrivateApiContext() as React.MutableRefObject<GridPrivateApiPro>;
  const rootProps = useGridRootProps();
  const classes = useUtilityClasses(rootProps);
  const { rowNode, id, field, descendantCount } = props;

  const loadingSelector = (state: GridStatePro) => state.dataSource.loading[id] ?? false;
  const errorSelector = (state: GridStatePro) => state.dataSource.errors[id];
  const isDataLoading = useGridSelector(apiRef, loadingSelector);
  const error = useGridSelector(apiRef, errorSelector);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (!rowNode.childrenExpanded) {
      // always fetch/get from cache the children when the node is expanded
      apiRef.current.unstable_dataSource.fetchRows(id);
    } else {
      apiRef.current.setRowChildrenExpansion(id, !rowNode.childrenExpanded);
    }
    apiRef.current.setCellFocus(id, field);
    event.stopPropagation(); // TODO remove event.stopPropagation
  };

  const Icon = rowNode.childrenExpanded
    ? rootProps.slots.treeDataCollapseIcon
    : rootProps.slots.treeDataExpandIcon;

  if (isDataLoading) {
    return (
      <div className={classes.loadingContainer}>
        <CircularProgress size="1rem" color="inherit" />
      </div>
    );
  }
  return descendantCount > 0 ? (
    <rootProps.slots.baseIconButton
      size="small"
      onClick={handleClick}
      tabIndex={-1}
      aria-label={
        rowNode.childrenExpanded
          ? apiRef.current.getLocaleText('treeDataCollapse')
          : apiRef.current.getLocaleText('treeDataExpand')
      }
      {...rootProps?.slotProps?.baseIconButton}
    >
      <rootProps.slots.baseTooltip title={error?.message ?? null}>
        <Badge variant="dot" color="error" invisible={!error}>
          <Icon fontSize="inherit" />
        </Badge>
      </rootProps.slots.baseTooltip>
    </rootProps.slots.baseIconButton>
  ) : null;
}

export function GridServerSideTreeDataGroupingCell(props: GridTreeDataGroupingCellProps) {
  const { id, field, formattedValue, rowNode, hideDescendantCount, offsetMultiplier = 2 } = props;

  const rootProps = useGridRootProps();
  const apiRef = useGridPrivateApiContext();
  const rowSelector = (state: GridStatePro) => state.rows.dataRowIdToModelLookup[id];
  const row = useGridSelector(apiRef, rowSelector);
  const classes = useUtilityClasses(rootProps);

  let descendantCount = 0;
  if (row) {
    descendantCount = Math.max(rootProps.unstable_dataSource?.getChildrenCount?.(row) ?? 0, 0);
  }

  return (
    <Box className={classes.root} sx={{ ml: rowNode.depth * offsetMultiplier }}>
      <div className={classes.toggle}>
        <GridTreeDataGroupingCellIcon
          id={id}
          field={field}
          rowNode={rowNode}
          row={row}
          descendantCount={descendantCount}
        />
      </div>
      <span>
        {formattedValue === undefined ? rowNode.groupingKey : formattedValue}
        {!hideDescendantCount && descendantCount > 0 ? ` (${descendantCount})` : ''}
      </span>
    </Box>
  );
}
