import React, { Component } from "react";
import { Redirect } from 'react-router';
import firebase from "../Firebase/FireBase.js";
import './FormStyle.css'
import NavBar from "../NavBar/NavBar";
import FileUploader from "react-firebase-file-uploader"; // https://www.npmjs.com/package/react-firebase-file-uploader
import Alert from 'react-s-alert';
import { Link } from 'react-router-dom'


function ClassesList(props) {
  let classes = props.classes;
  let phoneWidth = {};
  if(window.innerWidth < 500)
      phoneWidth.width = '100%';
  return (
    <div>
    {classes.length < 1 ?
      <span className="lablfav">אינך רשום לאף חוג כרגע</span>
      :
      <span className="lablfav">:החוגים אליהם אני רשום</span>}
      <br/>
    <div className="editclassesList" style={phoneWidth}>
      {classes.map((object, i) => {
          let d = new Date(object.date);
          let days = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];
          let dateFixed = object.date.slice(8)+"."+object.date.slice(-5,-3)+"."+object.date.slice(-12,-6);
              return (
                <Link to={"/Category/"+ object.category +"/Class/"+object.name} className="linkto">
                <div className="editProClass" key={i}>
                <div className="editclassdit">
                  <div className="classesnameDiv">{object.name}</div>
                  <div className="classesnameDiv">{days[d.getDay()]} {dateFixed} </div>
                </div>
                <div className="editclassditImg">
                <img src={object.imgUrl} className="editPro"/>
                </div>
                </div>
                </Link>
              );
          }
        )}
    </div>
    </div>
  );
}

function FavoritesCategeory(props) {
  // get the real category json from the DB

  let categories = [];
  let favorite;
  categories = props.categories;
  if(props.favoriteCat !== null && props.favoriteCat !== undefined)
  favorite = Object.values(props.favoriteCat);
  return (
      <div className="BigfavoritesCat">
        {categories.map((object, i) => {
          let strID = "ch" + i;
          let checked = false;
          if(props.favoriteCat !== null && props.favoriteCat !== undefined)
            if(favorite.includes(object.name))
              checked = true;
          return (
              <div key={i} className="favoritesCat">
              <input type="checkbox" checked={checked} id={strID} value={object.name} onChange={props.func}/>
            <label htmlFor={strID}>
            <img src={object.img} />
            <div className="textdivEdit">
            {object.name}
            </div>
            </label>
            </div>
            );
          })}
      </div>
  );
}

class EditProfile extends Component {
    constructor(props) {
        super(props);
        let end = false;
        let whyPhone = false;
        let favorite = props.location.state.user.favoriteCat
        if(favorite == undefined)
          favorite = [];
        
        let ListClass = props.location.state.user.ListOfSignInClasses
        if(ListClass == undefined)
          ListClass = [];
        this.state =  {
          id:props.location.state.user.id,
          email:props.location.state.user.email,
          name:props.location.state.user.name,
          phone:props.location.state.user.phone,
          img:props.location.state.user.img,
          favoriteCat:favorite,
          listOfSignInClass:[],
          ListOfSignInClasses:ListClass,
          progress:[]

        };
     
        this.handleChange = this.handleChange.bind(this);
        this.SetUser = this.SetUser.bind(this);
        this.handleUploadError = this.handleUploadError.bind(this);
        this.handleUploadSuccess = this.handleUploadSuccess.bind(this)
        this.handleProgress = this.handleProgress.bind(this)
    }

    componentDidMount(){
    let classes = [];
    let arrTemp =[]
    
    if(this.props.location.state.user.ListOfSignInClasses != undefined)
      classes = Object.values(this.props.location.state.user.ListOfSignInClasses);
      classes.forEach(element => {   
      firebase.database().ref('/CategoryList/' + element.category + "/classList/" + element.name).once('value', snapshot => {
        if(snapshot.val().isConfirmed){
          arrTemp = this.state.listOfSignInClass;
          arrTemp.push(snapshot.val());
          this.setState({listOfSignInClass:arrTemp});
        }
      });
    });
  }
      

    SetUser(){
      if(this.state.name == "" || this.state.phone == ""){
        Alert.warning("חובה להזין שם ומספר פלאפון");
        return;
      }
      let phoneno = /^\d{10}$/;
      if(!this.state.phone.match(phoneno)){
        Alert.warning("מספר הפלאפון שהכנסת לא תקין");
        return;
      }
      
        firebase.database().ref('/Users/' + this.state.id).set(this.state);
        
        this.setState({});
        window.scrollTo(0, 0);
        this.end = true;
        Alert.success("הפרטים נשמרו בהצלחה");
      }

    handleChange(e) {
      if(e.target.type == "checkbox"){
        let i = e.target.id.substring(2)
        let tempFavoriteCat = [];
        if(this.state.favoriteCat !== null && this.state.favoriteCat !== undefined)
            tempFavoriteCat = this.state.favoriteCat;
        if(tempFavoriteCat[i] == undefined)
          tempFavoriteCat[i] = e.target.value;
        else
          tempFavoriteCat[i] = null
        this.setState({favoriteCat:tempFavoriteCat})
      }
      else{
        this.setState({[e.target.name]: e.target.value});
      }
    }


      handleProgress = progress => this.setState({ progress:(progress+'%') });
      handleUploadError (error) {
        alert("Upload Error: " + error);
    };
    handleUploadSuccess(filename) {
    firebase
      .storage()
      .ref("usersImg")
      .child(filename)
      .getDownloadURL()
      .then(url => this.setState({ img: url,progress:[]}));
    };

    render() {
        let divWidth = {
            maxWidth: '35%'
          };
        let inputWidth ={};
        if(window.innerWidth < 500){ // if it is phone set the width to 100%
            divWidth.maxWidth = '100%';
            divWidth.width = '95%';
            divWidth.minWidth = '10%';
            inputWidth.width ='50%';
        }
        return (
        <div className="mainEditDiv">

        {this.end ? (<Redirect to="/" />):null}  
        <NavBar edit="edit" location={this.props.location.pathname}/>
        <div className="completeReg" style ={divWidth}>
        <form className="edit">
        <h1>איזור אישי</h1>
        <label>
        <div className="imguserc">
          <img className="user_e" src={this.state.img}/>
          <div className="useret">
              {this.state.progress}שנה תמונה
          </div>
        </div>
          <FileUploader
            hidden
            accept="image/*"
            randomizeFilename
            storageRef={firebase.storage().ref("usersImg")}
            onUploadError={this.handleUploadError}
            onUploadSuccess={this.handleUploadSuccess}
            onProgress={this.handleProgress}
          />
          </label>
        <label>
        <span className="labl">
        :שם מלא
        </span>
        <input style={inputWidth} type="tel" pattern="[0-9]{9}" name="name" value={this.state.name} onChange={this.handleChange}></input>
        </label>

        
        <label>
        <span className="labl">
        :הפלאפון שלך
        </span>
        {this.whyPhone? (<div className="whyPhone">
          אנחנו לא רוצים את הפרטים שלך סתם, אל חשש
          אנחנו רוצים שלמארגני המפגש יהיה דרך לוודא שכולם מגיעים
          ולעדכן בפרטים
          <br/>
          <span className="whyPhoneGetIt"  onClick={()=>{this.whyPhone = false;this.setState({})}}>הבנתי</span>
          </div>)
          :null}
          <span className="whyPhone" onClick={()=>{this.whyPhone = !this.whyPhone;this.setState({})}}>?</span>
            
        <input style={inputWidth} type="text" name="phone" value={this.state.phone} onChange={this.handleChange}></input> 
        
        </label>

        <br/>
        <ClassesList classes={this.state.listOfSignInClass} />
         
        <label>
        <span className="lablfav">
        <br/>
        קטגוריות מועדפות
        <br/>
        <span className="spanfavoriteCat">
        לפי זה נדע להראות את החוגים שהכי מתאימים לך
        </span> </span>
        <FavoritesCategeory func={this.handleChange} categories={this.props.location.state.categoryList} favoriteCat={this.state.favoriteCat}/>
        </label>
        <br/>
        <input className="greenBtnEditForm" type="button" value="שמור" onClick={this.SetUser}/>
      </form>
        </div>
        </div>
        )
    }
}

export default EditProfile;