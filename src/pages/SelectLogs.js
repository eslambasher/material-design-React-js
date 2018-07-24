import React from 'react';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import { withStyles } from '@material-ui/core/styles';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import InputLabel from '@material-ui/core/InputLabel';
import Input from '@material-ui/core/Input';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import TextField from '@material-ui/core/TextField';

const styles = theme => ({
  root : {
    margin : 40,
    textAlign : 'center'
  },
  container: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  formControl: {
    margin: theme.spacing.unit,
    minWidth: 500,
  },
  textField: {
   marginLeft: theme.spacing.unit,
   marginRight: theme.spacing.unit,
   width: 200,
 },
});

const apiIP = 'http://172.16.26.79:3000/'

class SelectLogs extends React.Component {
  state = {
    open: false,
    option: '',
    filename : '',
    valdateText : '',
    DataFiles : [],
  };

  handleChange = name => event => {
    this.setState({ [name]: !isNaN(parseFloat(event.target.value)) && isFinite(event.target.value) ? Number(event.target.value) : event.target.value});
  };

  handleClickOpen = () => {
    this.setState({ open: true });
  };

  handleClose = () => {
    this.setState({ open: false });
  };

  handleValdite = () => {
    this.props.valdateOption(this.state.option, this.state.valdateText, this.state.DataFiles[this.state.filename]);
    this.handleClose();
  }

  componentDidMount() {
    fetch(apiIP + 'filenames').then((res) => {
      return res.json();
    }).then((DataFiles) => {
      this.setState({DataFiles})
    }).catch((e) => {
      console.log("ERROR");
    })
  }

  render() {
    const { classes } = this.props;

    return (
      <div className={classes.root}>
        <Button onClick={this.handleClickOpen}>Select log file</Button>
        <Dialog
          disableBackdropClick
          disableEscapeKeyDown
          open={this.state.open}
          onClose={this.handleClose}
        >
          <DialogTitle>Choose your logs file</DialogTitle>
          <DialogContent>
            <form className={classes.container}>
              <FormControl className={classes.formControl}>
                <InputLabel htmlFor="age-native-simple">Options</InputLabel>
                <Select
                  native
                  value={this.state.option}
                  onChange={this.handleChange('option')}
                  input={<Input id="age-native-simple" />}
                >
                  <option value="" />
                  <option value={1}>Check logs</option>
                  <option value={2}>Valdate signature</option>
                </Select>
              </FormControl>
              <FormControl className={classes.formControl}>
                <InputLabel htmlFor="age-native-simple">File name</InputLabel>
                <Select
                 native
                 value={this.state.filename}
                 onChange={this.handleChange('filename')}
                 input={<Input id="age-native-simple" />}>
                   <option value="" />
                   {this.state.DataFiles.map((n, i) => (
                     <option key={i} value={i}>{n}</option>
                   ))}
               </Select>
              </FormControl>
                {this.state.option === 2 ? <TextField
                    id="valdateText"
                    label="Add your line for valdate it"
                    className={classes.formControl}
                    value={this.state.valdateText}
                    onChange={this.handleChange('valdateText')}
                    margin="normal"
                  /> :  null}
            </form>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleClose} color="primary">
              Cancel
            </Button>
            <Button onClick={this.handleValdite} color="primary">
              Valdate
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}

SelectLogs.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(SelectLogs);
