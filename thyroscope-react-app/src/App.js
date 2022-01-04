import React, { useMemo } from 'react';
import { useAsyncDebounce, useGlobalFilter, usePagination, useSortBy, useTable, useRowSelect } from 'react-table';
import { Button, Col, Container, Row } from 'reactstrap';
import './App.css';

const tableData = [
  {
    username: 'John',
    email: 'Johnjohn@thyroscope.com',
    nickname: 'moderator',
    gender: 'male',
    isChecked: false
  },
  {
    username: 'Frank',
    email: 'frank@thyroscope.com',
    nickname: 'mafia1',
    gender: 'male',
    isChecked: false
  },
  {
    username: 'Julie',
    email: 'julie@thyroscope.com',
    nickname: 'civilian2',
    gender: 'female',
    isChecked: false
  },
  {
    username: 'Steve',
    email: 'steve@thyroscope.com',
    nickname: 'civilian1',
    gender: 'male',
    isChecked: false
  },
]

const columnData = [
  {
    accessor: 'username',
    Header: 'username'
  },
  {
    accessor: 'email',
    Header: 'email',
    disableGlobalFilter: true,
  },
  {
    accessor: 'nickname',
    Header: 'nickname',
    disableGlobalFilter: true,
  },
  {
    accessor: 'gender',
    Header: 'gender',
    disableGlobalFilter: true,
  },
]

const IndeterminateCheckbox = React.forwardRef(
  ({ indeterminate, ...rest }, ref) => {
    const defaultRef = React.useRef()
    const resolvedRef = ref || defaultRef

    React.useEffect(() => {
      resolvedRef.current.indeterminate = indeterminate
    }, [resolvedRef, indeterminate])

    return (
      <>
        <input type="checkbox" ref={resolvedRef} {...rest} />
      </>
    )
  }
)

const EditableCell = ({
  value: initialValue,
  row: { index, isSelected },
  column: { id },
  updateMyData, // This is a custom function that we supplied to our table instance
}) => {
  // We need to keep and update the state of the cell normally
  const [value, setValue] = React.useState(initialValue)

  const onChange = e => {
    setValue(e.target.value)
    //updateMyData(index, id, value);
  }

  // We'll only update the external data when the input is blurred
  const onBlur = () => {
    updateMyData(index, id, value)
  }

  // If the initialValue is changed external, sync it up with our state
  React.useEffect(() => {
    setValue(initialValue)
  }, [initialValue])

  // console.log('initialValue ', initialValue);
  // console.log('###', isSelected);

  return (
    isSelected ?
      <input value={value} onChange={onChange} onBlur={onBlur} /> :
      value
  )
}

// Set our editable cell renderer as the default Cell renderer
const defaultColumn = {
  Cell: EditableCell,
}

function GlobalFilter({
  preGlobalFilteredRows,
  globalFilter,
  setGlobalFilter,
}) {
  const count = preGlobalFilteredRows.length
  const [value, setValue] = React.useState(globalFilter)
  const onChange = useAsyncDebounce(value => {
    setGlobalFilter(value || undefined)
  }, 200)

  return (
    <span>
      Search:{' '}
      <input
        value={value || ""}
        onChange={e => {
          setValue(e.target.value);
          onChange(e.target.value);
        }}
        placeholder={'search by username'}
        style={{
          fontSize: '1.1rem',
          border: '0',
        }}
      />
    </span>
  )
}



function App() {
  const columns = useMemo(() => columnData, []);
  //const data = useMemo(() => tableData, []);
  const [data, setData] = React.useState(useMemo(() => tableData, []));
  const [originalData] = React.useState(useMemo(() => tableData, []));
  const [skipPageReset, setSkipPageReset] = React.useState(false)



  React.useEffect(() => {
    console.log('here');
    setSkipPageReset(false);
    setData(originalData);
  }, [skipPageReset])

  //  const data = useMemo(() => tableData, []);
  // We need to keep the table from resetting the pageIndex when we
  // Update data. So we can keep track of that flag with a ref.

  // When our cell renderer calls updateMyData, we'll use
  // the rowIndex, columnId and new value to update the
  // original data
  const updateMyData = (rowIndex, columnId, value) => {
    // We also turn on the flag to not reset the page
    setSkipPageReset(true)
    setData(old =>
      old.map((row, index) => {
        if (index === rowIndex) {
          return {
            ...old[rowIndex],
            [columnId]: value,
          }
        }
        return row
      })
    )
  }

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    canPreviousPage,
    canNextPage,
    nextPage,
    previousPage,
    state: { pageIndex, pageSize, globalFilter },
    state,
    visibleColumns,
    preGlobalFilteredRows,
    setGlobalFilter,
  } = useTable(
    {
      columns,
      data,
      defaultColumn,
      initialState: { pageIndex: 0, pageSize: 10 },
      updateMyData
    },
    useGlobalFilter,
    useSortBy,
    usePagination,
    useRowSelect,
    hooks => {
      hooks.visibleColumns.push(columns => [
        {
          id: 'selection',
          Cell: ({ row }) => (
            <div>
              <IndeterminateCheckbox {...row.getToggleRowSelectedProps()} />
            </div>
          ),
        },
        ...columns,
      ])
    }
  )

  return (
    <Container>
      <Row className="sm-10">
        <h2>Add User</h2>
        <Col>
          username
          <Row>
            <input />
          </Row>
        </Col>
        <Col>
          <Row>
            email
          </Row>
          <Row>
            <input />
          </Row>
        </Col>
        <Col>
          <Row>
            nickname
          </Row>
          <Row>
            <input />
          </Row>
        </Col>
        <Col>
          <Row>
            gender
          </Row>
          <Row>
            <input />
          </Row>
        </Col>
      </Row>

      <Button>Add</Button>
      <h2>Users</h2>
      {/* {tableData.length} users */}
      {rows.length} users
      <table {...getTableProps()} >

        <thead>
          <tr>
            <th
              colSpan={visibleColumns.length}
              style={{
                textAlign: 'left',
              }}
            >
              <GlobalFilter
                preGlobalFilteredRows={preGlobalFilteredRows}
                globalFilter={state.globalFilter}
                setGlobalFilter={setGlobalFilter}
              />
            </th>
          </tr>
          {headerGroups.map(headerGroup => (

            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map(column => (
                <th
                  {...column.getHeaderProps(column.getSortByToggleProps())}
                >
                  {column.render('Header')}
                  <span>
                    {column.isSorted
                      ? column.isSortedDesc
                        ? ' ↓'
                        : ' ↑'
                      : ''}
                  </span>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {rows.map(row => {
            // console.log('row is ', row);
            prepareRow(row)
            return (
              <tr {...row.getRowProps()}>
                {row.cells.map(cell => {
                  return (
                    <td
                      {...cell.getCellProps()}
                      style={{
                        padding: '10px',
                      }}
                    >
                      {cell.render('Cell')}
                    </td>
                  )
                })}
                {
                  row.isSelected ?
                    <td>
                      <button value={row.values.username} onClick={() => console.log('click the save ' + row.values.username)}>
                        save
                      </button>
                      <button value={row.values.username} onClick={() => console.log('click the delete')}>
                        delete
                      </button>
                    </td>
                    :
                    <React.Fragment />
                }
              </tr>
            )
          })}
        </tbody>
      </table >
      <div className="pagination">

        <button onClick={() => previousPage()} disabled={!canPreviousPage}>
          {'<'}
        </button>{' '}
        <span>
          <strong>
            &nbsp;{pageIndex + 1}&nbsp;
          </strong>
        </span>

        <button onClick={() => nextPage()} disabled={!canNextPage}>
          {'>'}
        </button>{' '}


      </div>
    </Container >
  );
}

export default App;
