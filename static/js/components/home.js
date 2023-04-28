const home = Vue.component("home", {
  template : `
              <div>
                <h1> Welcome {{details.username}}</h1>
                
  <div class="row">
    <div class="col-sm-3" style="background-color:lavender;margin-left: auto;">
      <p><h5>Profile Picture</h5></p>
      <img :src="imagesrc" class="img-responsive" style="width:35%" alt="Image"/>
      <div style="margin-top: 10px;">
        <button @click="confirmppupdate">Update</button>        
      </div>
    </div>
    
    <div class="col-sm-2" style="background-color:lavender;margin-left: auto;"> 
      <p><h5>Total Posts</h5></p>
      <p><h2>{{details.nop}}</h2></p>
    </div>
    <div class="col-sm-2" style="background-color:lavender;margin-left: auto;"> 
      <p><h5>Following</h5></p>
      <p><router-link to="/following"><h2>{{details.following}}</h2></router-link></p>
    </div>
    <div class="col-sm-2" style="background-color:lavender; margin-left: auto;"> 
      <p><h5>Followers</h5></p>
      <p><router-link to="/followers"><h2>{{details.nof}}</h2></router-link></p>
    </div>
  </div>
  <p>
  <div v-if="showppupdate" style="background-color:darkgray;">
              <p>Please update the Profile Picture path or URL</p>
              <input type="text" v-model="upppath"><br><br>
              <button @click="submitForm">Submit</button>
              <button @click="closeppupdate">Close</button>
        </div>
        </p>
  <div style = "margin-top: 30px;margin-bottom: auto;">
  <h3>My Posts</h3>
  <div class="row">
    <div v-for="post in posts" :key="post.post_id" style="background-color:lavender;margin-left: auto;" 
    v-bind:style="{border: '1px solid black',padding: '2px'}">	  
      <div class="col-sm-3"> 
        <p><h5>{{post.title}}</h5></p>
        <router-link class="link-style" :to="'/post/'+ post.post_id">View full post -></router-link>
        <p>
         <span style="margin-right: 10px;">
         <button @click="editpageredirect(post.post_id)">Edit</button></span>
         <button @click="confirmdelete(post.post_id)">Remove</button></p>
            <div v-if="showconfirm && post.post_id==pid" style="background-color:darkgray;">
              <p>Are you sure you want to delete this post?</p>
              <button @click="deletepost(post.post_id)">Yes</button>
              <button @click="canceldelete">No</button>
            </div>
      </div>
    </div>
    </div>
    <div style = "margin-top: 30px;margin-bottom: auto;">
    <h3>Export CSV details</h3>
    <div class="row">
           <h6>Export Followers <button @click="followercsv" :disabled="details.nof === 0">Export</button></h6>
           <h6>Export Following <button @click="followingcsv" :disabled="details.following === 0">Export</button></h6>
           <h6>Export Feed <button @click="feedcsv" :disabled="details.following === 0">Export</button></h6>
           <h6>Export My posts <button @click="mypostscsv" :disabled="details.nop === 0">Export</button></h6>
        </div>
      </div>
      </div>
  </div>
  </div>
  </div>
              `
,
data: function(){
  return{
    posts:null,
    details:null,
    showconfirm:false,
    pid:null,
    imagesrc:null,
    showppupdate:false,
    upppath:null
  }
},
methods:
    {async getDetails() {
     await fetch(`http://127.0.0.1:5000/getcu`,
      {method:"GET",
      headers: {
        "Content-Type":"application/json"}})
        .then(resp => resp.json())
        .then(data => {this.details= data;})
        .catch(error => {console.log(error);});
        this.getimage()},
      getPosts() {
          fetch(`http://127.0.0.1:5000/getcuposts`,
           {method:"GET",
           headers: {
             "Content-Type":"application/json"}})
             .then(resp => resp.json())
             .then(data => {this.posts= data;})
             .catch(error => {console.log(error);})},
      confirmdelete(postid){
        this.showconfirm = true;
        this.pid = postid;        
      },
      deletepost(postid){
        this.showconfirm = false;
        this.pid = postid;
        fetch(`http://127.0.0.1:5000/deletepost/${this.pid}`,
           {method:"GET",
           headers: {
             "Content-Type":"application/json"}});
             this.$router.go();
      },
      canceldelete(){
        this.showconfirm = false;
      },
      editpageredirect(postid){
        this.pid = postid;
        this.$router.push(`/postedit/${this.pid}`);},
      feedcsv() {
        fetch(`http://127.0.0.1:5000/feedcsv`,
        {method:"GET",
        headers: {
        "Content-Type":"application/json"}})
        .then(resp => resp.json())},
      followercsv() {
        fetch(`http://127.0.0.1:5000/followercsv`,
        {method:"GET",
        headers: {
        "Content-Type":"application/json"}})
        .then(resp => resp.json())},
      followingcsv() {
        fetch(`http://127.0.0.1:5000/followingcsv`,
        {method:"GET",
        headers: {
        "Content-Type":"application/json"}})
        .then(resp => resp.json())},
      mypostscsv() {
        fetch(`http://127.0.0.1:5000/mypostscsv`,
        {method:"GET",
        headers: {
        "Content-Type":"application/json"}})
        .then(resp => resp.json())},
      
      confirmppupdate(){
        this.showppupdate = true;      
          },
      closeppupdate(){
        this.showppupdate = false;
      },
      submitForm() {
          const response = fetch(`http://127.0.0.1:5000/updatepp`, 
          {method: 'POST',headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({ profilepic:this.upppath })
          });
            this.$router.go()},
      getimage() {
        const url = `http://127.0.0.1:5000/userpp/${this.details.id}`
        fetch(url)
        .then(response => {
        if (response.headers.get('content-type').startsWith('text/')) {
          return response.text();} 
        else {return response.blob();}})
        .then(data => {if (typeof data === 'string') {
          this.imagesrc = data;} 
        else {
          const blob = new Blob([data], { type: 'image/png' })
          const reader = new FileReader()
          reader.onload = () => {
          this.imagesrc = reader.result}
          reader.readAsDataURL(blob)}
                })
            }},
    created(){this.getDetails()},
    mounted(){this.getPosts()}
})

export default home;

