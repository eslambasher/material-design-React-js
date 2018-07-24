import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import Tooltip from '@material-ui/core/Tooltip';
import CircularProgress from '@material-ui/core/CircularProgress';

function getSorting(order, orderBy) {
  return order === 'desc'
    ? (a, b) => (b[orderBy] < a[orderBy] ? -1 : 1)
    : (a, b) => (a[orderBy] < b[orderBy] ? -1 : 1);
}

const columnData = [
  { id: 'id', numeric: true, disablePadding: false, label: 'Id' },
  { id: 'filename', numeric: false, disablePadding: false, label: 'Filename' },
  { id: 'merkle_root', numeric: false, disablePadding: false, label: 'Merkle root' },
  { id: 'created_at', numeric: false, disablePadding: false, label: 'Created at' },
  { id: 'validated_at', numeric: false, disablePadding: false, label: 'Validated at' },
];

const apiIP = 'http://172.16.26.79:3000/'

class EnhancedTableHead extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      filename : this.props.filename
    }
  }
  createSortHandler = property => event => {
    this.props.onRequestSort(event, property);
  };

  render() {
    const { order, orderBy } = this.props;

    return (
      <TableHead>
        <TableRow>
          {columnData.map(column => {
            return (this.state.filename &&  column.id === "filename"? null : <TableCell
                key={column.id}
                numeric={column.numeric}
                padding={column.disablePadding ? 'none' : 'default'}
                sortDirection={orderBy === column.id ? order : false}
              >
                <Tooltip
                  title="Sort"
                  placement={column.numeric ? 'bottom-end' : 'bottom-start'}
                  enterDelay={300}
                >
                  <TableSortLabel
                    active={orderBy === column.id}
                    direction={order}
                    onClick={this.createSortHandler(column.id)}
                  >
                    {column.label}
                  </TableSortLabel>
                </Tooltip>
              </TableCell>
            );
          }, this)}
        </TableRow>
      </TableHead>
    );
  }
}

EnhancedTableHead.propTypes = {
  onRequestSort: PropTypes.func.isRequired,
  order: PropTypes.string.isRequired,
  orderBy: PropTypes.string.isRequired,
};


const styles = theme => ({
  root: {
    width: '85%',
    marginTop: theme.spacing.unit,
    marginLeft: theme.spacing.unit * 15,
  },
  table: {
    minWidth: 1100,
  },
  progress: {
    textAlign : 'center',
     margin: 200,
     marginLeft : '48%'
   },
});

class EnhancedTable extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      order: 'desc',
      orderBy: 'id',
      selected: [],
      data: [],
      page: 0,
      rowsPerPage: 5,
      filename : this.props.filename,
      shudeUpdate : this.props.shudeUpdate
    };
  }

  componentDidMount() {
    fetch(apiIP + 'logs').then((res) => {
      return res.json();
    }).then((data) => {
      this.setState({data})
    }).catch((e) => {
      console.log("ERROR");
    })
  }

  handleRequestSort = (event, property) => {
    const orderBy = property;
    let order = 'desc';

    if (this.state.orderBy === property && this.state.order === 'desc') {
      order = 'asc';
    }
    this.setState({ order, orderBy });
  };

  handleClick = (event, id) => {
  };

  componentDidUpdate(prevProps, prevState) {
    if (this.state.shudeUpdate) {
      this.setState({shudeUpdate : false})
      this.getfileDate(this.props.filename);
      return false;
    }
  }

  static getDerivedStateFromProps(props, state) {
    if (props.filename !== state.filename) {
      return {
        filename: props.filename,
        shudeUpdate : props.shudeUpdate
      }
    }
    return false;
  }

  getfileDate = (filename) => {
      fetch(apiIP + 'logs?name=' + filename).then(res => {
        return res.json();
      }).then(data => {
        this.setState({data})
        this.props.closeLoading();
      }).catch(e => {
        console.log(e);
      })
  }

  handleChangePage = (event, page) => {
    this.setState({ page });
  };

  handleChangeRowsPerPage = event => {
    this.setState({ rowsPerPage: event.target.value });
  };

  isSelected = id => this.state.selected.indexOf(id) !== -1;

  render() {
    const { classes } = this.props;
    const { data, order, orderBy, rowsPerPage, page } = this.state;

    return (this.state.shudeUpdate ? <CircularProgress className={classes.progress} size={50} /> : <Paper className={classes.root}> <Toolbar>
        <div>
            {!this.state.filename ? <Typography variant="title" id="tableTitle"> All logs </Typography> :  <Typography variant="title" id="tableTitle">File name : {this.state.filename}</Typography>}
        </div>
      </Toolbar>
          <Table className={classes.table} aria-labelledby="tableTitle">
            <EnhancedTableHead
            filename={this.state.filename}
              order={order}
              orderBy={orderBy}
              onRequestSort={this.handleRequestSort}
            />
            <TableBody>
              {this.state.data
                .sort(getSorting(order, orderBy))
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((n , i)=> {
                  const isSelected = this.isSelected(n.id);
                  return (
                    <TableRow
                      hover
                      onClick={event => this.handleClick(event, n.id)}
                      role="checkbox"
                      aria-checked={isSelected}
                      tabIndex={-1}
                      key={i}
                      selected={isSelected}
                    >
                    <TableCell  component="th" scope="row" numeric>
                    {n.id}
                    </TableCell>
                    {!this.props.filename ? <TableCell>{n.filename.toString()}</TableCell> : null}
                    <TableCell>{n.merkle_root.toString()}</TableCell>
                    <TableCell>{n.created_at.toString()}</TableCell>
                    <TableCell>{n.validated_at ? n.validated_at.toString() : "Not Valdate"}</TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        <TablePagination
          component="div"
          count={data.length}
          rowsPerPage={rowsPerPage}
          page={page}
          backIconButtonProps={{
            'aria-label': 'Previous Page',
          }}
          nextIconButtonProps={{
            'aria-label': 'Next Page',
          }}
          onChangePage={this.handleChangePage}
          onChangeRowsPerPage={this.handleChangeRowsPerPage}
        />
      </Paper>
    );
  }
}

EnhancedTable.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(EnhancedTable);
