import React from 'react';
import PropTypes from 'prop-types';
import Typography from '@material-ui/core/Typography';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import Snackbar from '@material-ui/core/Snackbar';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Slide from '@material-ui/core/Slide';
import SocketIOClient from 'socket.io-client';

import withRoot from '../withRoot';
import LogsTable from './LogsTable'
import SelectLogs from './SelectLogs'



const styles = theme => ({
  root: {
  alignSelf: 'center'
  },
  flex: {
    flexGrow: 1,
  },
  center: {
    textAlign: 'center',
  },
  button: {
   margin: 50,
 },
 extendedIcon: {
   marginRight: theme.spacing.unit,
 },

});

const apiIP = 'http://172.16.26.79:3000/'

class Index extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      filename : '',
      option : '',
      loading : false,
      valdateText : '',
      message : '',
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      showDialog: false,
      notifications : [],
    }
    this.valdateOption = this.valdateOption.bind();
    this.closeLoading = this.closeLoading.bind();
    this.socket = SocketIOClient(apiIP,  {
          reconnection: true,
          reconnectionDelay: 1000,
          reconnectionDelayMax : 5000,
          reconnectionAttempts: Infinity
    });
     this.socket.on('HashFile' , (message) => {
      this.setState({message : message.message, open : true});
     })
  }
  componentDidMount() {
    this.getNotification();
    this.getCourentTime();
  }

  getCourentTime = () => {
    fetch(apiIP + 'last_update').then((res) => {
      return res.json();
    }).then(time => {
      let that = this;
      var countDownDate = new Date(time).getTime();
      setInterval(function() {
        var now = new Date().getTime();
        var distance = countDownDate - now;
        var days = Math.floor(distance / (1000 * 60 * 60 * 24));
        var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        var seconds = Math.floor((distance % (1000 * 60)) / 1000);
        that.setState({days: days, hours: hours, minutes: minutes, seconds: seconds})
      }, 1000);
    }).catch(e => {
      console.log(e);
    })
  }

  Transition = (props) => {
    return <Slide direction="up" {...props} />;
  }

 handleClick = () => {
   this.setState({ open: true,});
 };

 handleClose = (event, reason) => {
   if (reason === 'clickaway') {
     return;
   }
   this.setState({ open: false});
 };


 valdateOption = (option, valdateText, filename) => {
     this.setState({option, valdateText, filename, loading : !this.state.loading});
     if (valdateText !== '') {
       this.sendValdateText();
     }
   }

   sendValdateText = () => {
     this.setState({message : "Your valdate text has been sended", open : true});
     fetch(apiIP + 'leaf?name=' + this.state.filename + '&signature=' + this.state.message).then((res) => {
       return res.json();
     }).then(message => {
       this.setState({message : message.message, open : true});
     }).catch(e => {
       console.log(e);
     })
   }

   getNotification =() => {
     fetch(apiIP + 'notifications').then((res) => {
       return res.json();
     }).then(notifications => {
       this.setState({notifications});
     }).catch(e => {
       console.log(e);
     })
   }
  closeLoading = () => { this.setState({loading : !this.state.loading})}

  afficheMessage = (classes, message) => {
    let that = this;
    setTimeout(function(){ that.handleClose() }, 2000);
    return (<Snackbar
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        open={this.state.open}
        autoHideDuration={6000}
        onClose={this.handleClose}
        ContentProps={{
          'aria-describedby': 'message-id',
        }}
        message={<span id="message-id">{message}</span>}
        action={[
          <Button key="undo" color="secondary" size="small" onClick={this.handleClose}>
            OK
          </Button>,
        ]}
      />)
  }

  validateMarkelTree = () => {
    fetch(apiIP + 'loghash?name='+this.state.filename).then((res) => {
      return res.json();
    }).then(message => {
      this.setState({message : message, open : true});
    }).catch(e => {
      console.log(e);
    })
  }

  showNotification = (classes) => {
  return (
    <List component="nav">
    {this.state.notifications && this.state.notifications.map((n , i) => {
      return (<ListItem key={i} button>
            <ListItemText inset primary={n.filename + " : " + n.message} />
          </ListItem>);
    })}
    </List>
  );
}

  render() {
    const { classes } = this.props;
    return (
      <div style={{ backgroundColor: '#ffffff'}}>
        <AppBar className={classes.root} style={{ backgroundColor: '#2196F3' }} position="static" >
        <Toolbar>
          <Typography variant="title" color="inherit" className={classes.flex}>
            Docusign
          </Typography>
          <Typography  color="inherit">
            Next update : {this.state.hours + "h" + this.state.minutes + "m" + this.state.seconds + "s"}
          </Typography>
          <Button  style={{marginLeft : 10, color : '##2196F3'}} onClick={() => this.setState({showDialog : !this.state.showDialog})}>
           Notifications
         </Button>
        </Toolbar>
            </AppBar>
            <SelectLogs valdateOption={this.valdateOption}/>
             <LogsTable filename={this.state.filename} shudeUpdate={this.state.filename ? true : false} closeLoading={this.closeLoading} />
          <div className={classes.center}>
            <Button variant="extendedFab" style={{color :'#ffffff', backgroundColor: '#2196F3' }} aria-label="Delete" className={classes.button} onClick={this.validateMarkelTree}>
              <CheckCircleIcon className={classes.extendedIcon} />
              Valdate markel tree
            </Button>
            <div>
            {this.state.open ? this.afficheMessage(classes, this.state.message, this.state.time) : null}
            <Dialog
              open={this.state.showDialog}
              TransitionComponent={this.Transition}
              keepMounted
              onClose={this.handleClose}
              aria-labelledby="alert-dialog-slide-title"
              aria-describedby="alert-dialog-slide-description"
            >
              <DialogTitle id="alert-dialog-slide-title">
                {"Notifications"}
              </DialogTitle>
              <DialogContent>
                <DialogContentText id="alert-dialog-slide-description">
                <this.showNotification />
                </DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => this.setState({showDialog : !this.state.showDialog})} color="primary">
                  Ok
                </Button>
              </DialogActions>
            </Dialog>
            </div>
          </div>
      </div>
    );
  }
}

Index.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withRoot(withStyles(styles)(Index));
