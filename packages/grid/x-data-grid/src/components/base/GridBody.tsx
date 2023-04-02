import * as React from 'react';
import PropTypes from 'prop-types';
import { useGridPrivateApiContext } from '../../hooks/utils/useGridPrivateApiContext';
import { useGridSelector } from '../../hooks/utils/useGridSelector';
import { ElementSize } from '../../models/elementSize';
import { GridMainContainer } from '../containers/GridMainContainer';
import { GridAutoSizer } from '../GridAutoSizer';
import { useGridRootProps } from '../../hooks/utils/useGridRootProps';
import {
  gridColumnPositionsSelector,
  gridColumnVisibilityModelSelector,
  gridVisibleColumnDefinitionsSelector,
} from '../../hooks/features/columns/gridColumnsSelector';
import { gridFilterActiveItemsLookupSelector } from '../../hooks/features/filter/gridFilterSelector';
import { gridSortColumnLookupSelector } from '../../hooks/features/sorting/gridSortingSelector';
import {
  gridTabIndexColumnHeaderFilterSelector,
  gridTabIndexColumnHeaderSelector,
  gridTabIndexCellSelector,
  gridFocusColumnHeaderSelector,
  unstable_gridTabIndexColumnGroupHeaderSelector,
  unstable_gridFocusColumnGroupHeaderSelector,
} from '../../hooks/features/focus/gridFocusStateSelector';
import { gridDensityFactorSelector } from '../../hooks/features/density/densitySelector';
import {
  gridColumnGroupsHeaderMaxDepthSelector,
  gridColumnGroupsHeaderStructureSelector,
} from '../../hooks/features/columnGrouping/gridColumnGroupsSelector';
import { gridColumnMenuSelector } from '../../hooks/features/columnMenu/columnMenuSelector';

interface GridBodyProps {
  children?: React.ReactNode;
  ColumnHeadersProps?: Record<string, any>;
  VirtualScrollerComponent: React.JSXElementConstructor<
    React.HTMLAttributes<HTMLDivElement> & {
      ref: React.Ref<HTMLDivElement>;
      disableVirtualization: boolean;
    }
  >;
}

function GridBody(props: GridBodyProps) {
  const { children, VirtualScrollerComponent, ColumnHeadersProps } = props;
  const apiRef = useGridPrivateApiContext();
  const rootProps = useGridRootProps();

  const visibleColumns = useGridSelector(apiRef, gridVisibleColumnDefinitionsSelector);
  const filterColumnLookup = useGridSelector(apiRef, gridFilterActiveItemsLookupSelector);
  const sortColumnLookup = useGridSelector(apiRef, gridSortColumnLookupSelector);
  const columnPositions = useGridSelector(apiRef, gridColumnPositionsSelector);
  const columnHeaderFilterTabIndexState = useGridSelector(
    apiRef,
    gridTabIndexColumnHeaderFilterSelector,
  );

  const columnHeaderTabIndexState = useGridSelector(apiRef, gridTabIndexColumnHeaderSelector);
  const cellTabIndexState = useGridSelector(apiRef, gridTabIndexCellSelector);
  const columnGroupHeaderTabIndexState = useGridSelector(
    apiRef,
    unstable_gridTabIndexColumnGroupHeaderSelector,
  );

  const columnHeaderFocus = useGridSelector(apiRef, gridFocusColumnHeaderSelector);
  const columnGroupHeaderFocus = useGridSelector(
    apiRef,
    unstable_gridFocusColumnGroupHeaderSelector,
  );

  const densityFactor = useGridSelector(apiRef, gridDensityFactorSelector);
  const headerGroupingMaxDepth = useGridSelector(apiRef, gridColumnGroupsHeaderMaxDepthSelector);

  const columnMenuState = useGridSelector(apiRef, gridColumnMenuSelector);
  const columnVisibility = useGridSelector(apiRef, gridColumnVisibilityModelSelector);
  const columnGroupsHeaderStructure = useGridSelector(
    apiRef,
    gridColumnGroupsHeaderStructureSelector,
  );

  const hasOtherElementInTabSequence = !(
    columnGroupHeaderTabIndexState === null &&
    columnHeaderFilterTabIndexState === null &&
    columnHeaderTabIndexState === null &&
    cellTabIndexState === null
  );

  const [isVirtualizationDisabled, setIsVirtualizationDisabled] = React.useState(
    rootProps.disableVirtualization,
  );

  const disableVirtualization = React.useCallback(() => {
    setIsVirtualizationDisabled(true);
  }, []);

  const enableVirtualization = React.useCallback(() => {
    setIsVirtualizationDisabled(false);
  }, []);

  React.useEffect(() => {
    setIsVirtualizationDisabled(rootProps.disableVirtualization);
  }, [rootProps.disableVirtualization]);

  // The `useGridApiMethod` hook can't be used here, because it only installs the
  // method if it doesn't exist yet. Once installed, it's never updated again.
  // This break the methods above, since their closure comes from the first time
  // they were installed. Which means that calling `setIsVirtualizationDisabled`
  // will trigger a re-render, but it won't update the state. That can be solved
  // by migrating the virtualization status to the global state.
  apiRef.current.unstable_disableVirtualization = disableVirtualization;
  apiRef.current.unstable_enableVirtualization = enableVirtualization;

  const columnHeadersRef = React.useRef<HTMLDivElement>(null);
  const columnsContainerRef = React.useRef<HTMLDivElement>(null);
  const virtualScrollerRef = React.useRef<HTMLDivElement>(null);

  apiRef.current.register('private', {
    columnHeadersContainerElementRef: columnsContainerRef,
    columnHeadersElementRef: columnHeadersRef,
    virtualScrollerRef,
  });

  const handleResize = React.useCallback(
    (size: ElementSize) => {
      apiRef.current.publishEvent('resize', size);
    },
    [apiRef],
  );

  return (
    <GridMainContainer>
      <rootProps.slots.columnHeaders
        ref={columnsContainerRef}
        innerRef={columnHeadersRef}
        visibleColumns={visibleColumns}
        filterColumnLookup={filterColumnLookup}
        sortColumnLookup={sortColumnLookup}
        columnPositions={columnPositions}
        columnHeaderTabIndexState={columnHeaderTabIndexState}
        columnGroupHeaderTabIndexState={columnGroupHeaderTabIndexState}
        columnHeaderFilterTabIndexState={columnHeaderFilterTabIndexState}
        columnHeaderFocus={columnHeaderFocus}
        columnGroupHeaderFocus={columnGroupHeaderFocus}
        densityFactor={densityFactor}
        headerGroupingMaxDepth={headerGroupingMaxDepth}
        columnMenuState={columnMenuState}
        columnVisibility={columnVisibility}
        columnGroupsHeaderStructure={columnGroupsHeaderStructure}
        hasOtherElementInTabSequence={hasOtherElementInTabSequence}
        {...ColumnHeadersProps}
      />
      <GridAutoSizer
        nonce={rootProps.nonce}
        disableHeight={rootProps.autoHeight}
        onResize={handleResize}
      >
        <VirtualScrollerComponent
          ref={virtualScrollerRef}
          disableVirtualization={isVirtualizationDisabled}
        />
      </GridAutoSizer>
      {children}
    </GridMainContainer>
  );
}

GridBody.propTypes = {
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // | To update them edit the TypeScript types and run "yarn proptypes"  |
  // ----------------------------------------------------------------------
  children: PropTypes.node,
  ColumnHeadersProps: PropTypes.object,
  VirtualScrollerComponent: PropTypes.elementType.isRequired,
} as any;

export { GridBody };
