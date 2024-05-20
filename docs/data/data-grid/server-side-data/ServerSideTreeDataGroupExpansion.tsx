import * as React from 'react';
import {
  DataGridPro,
  useGridApiRef,
  GridInitialState,
  GridToolbar,
  GridDataSource,
} from '@mui/x-data-grid-pro';
import Button from '@mui/material/Button';
import { useMockServer } from '@mui/x-data-grid-generator';

const pageSizeOptions = [5, 10, 50];

export default function ServerSideTreeDataGroupExpansion() {
  const apiRef = useGridApiRef();

  const {
    fetchRows,
    columns,
    initialState,
    getGroupKey,
    getChildrenCount,
    hasChildren,
  } = useMockServer({
    dataSet: 'Employee',
    rowLength: 1000,
    treeData: { maxDepth: 3, groupingField: 'name', averageChildren: 5 },
  });

  const dataSource: GridDataSource = React.useMemo(
    () => ({
      getRows: async (params) => {
        const urlParams = new URLSearchParams({
          paginationModel: encodeURIComponent(
            JSON.stringify(params.paginationModel),
          ),
          filterModel: encodeURIComponent(JSON.stringify(params.filterModel)),
          sortModel: encodeURIComponent(JSON.stringify(params.sortModel)),
          groupKeys: encodeURIComponent(JSON.stringify(params.groupKeys)),
        });
        const getRowsResponse = await fetchRows(
          `https://mui.com/x/api/data-grid?${urlParams.toString()}`,
        );
        return {
          rows: getRowsResponse.rows,
          rowCount: getRowsResponse.rowCount,
        };
      },
    }),
    [fetchRows],
  );

  const initialStateWithPagination: GridInitialState = React.useMemo(
    () => ({
      ...initialState,
      pagination: {
        paginationModel: {
          pageSize: 5,
        },
        rowCount: 0,
      },
    }),
    [initialState],
  );

  return (
    <div style={{ width: '100%' }}>
      <Button onClick={() => apiRef.current.clearCache()}>Reset cache</Button>
      <div style={{ height: 400 }}>
        <DataGridPro
          columns={columns}
          unstable_dataSource={dataSource}
          getGroupKey={getGroupKey}
          hasChildren={hasChildren}
          getChildrenCount={getChildrenCount}
          treeData
          apiRef={apiRef}
          pagination
          pageSizeOptions={pageSizeOptions}
          initialState={initialStateWithPagination}
          slots={{ toolbar: GridToolbar }}
          slotProps={{ toolbar: { showQuickFilter: true } }}
          defaultGroupingExpansionDepth={-1}
        />
      </div>
    </div>
  );
}
