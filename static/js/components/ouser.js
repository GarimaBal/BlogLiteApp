const ouser=Vue.component("ouser", {
  
    template : `
                <div>
                  <h1> User Profile: {{details.username}}</h1>
                  
      <div class="row" >
      <div class="col-sm-3" style="background-color:lavender;margin-left: auto;">
        <p><h5>Profile Picture</h5></p>
          <img :src="imagesrc" class="img-responsive" style="width:35%" alt="Image"/>
      </div>
      <div class="col-sm-2" style="background-color:lavender;margin-left: auto;margin-top: 20px;"> 
        <p><h5>Total Posts</h5></p>
        <p><h2>{{details.nop}}</h2></p>
      </div>
      <div class="col-sm-2" style="background-color:lavender;margin-left: auto;margin-top: 20px;"> 
        <p><h5>Following</h5></p>
        <p><h2>{{details.following}}</h2></p>
      </div>
      <div class="col-sm-2" style="background-color:lavender; margin-left: auto;margin-top: 20px;"> 
        <p><h5>followers</h5></p>
        <p><h2>{{details.nof}}</h2></p>
      </div>
    </div>
    <div style = "margin-top: 30px;margin-bottom: 30px;">
    <h5>Following: {{this.follow}}</h5>
    <button v-if="this.follow==='False'" @click="followuser()">Follow</button>
    <button v-else @click="unfollowuser">Unfollow</button>
    </div>
    <div style = "margin-top: auto;margin-bottom: auto;">
    
    <h3>User Posts</h3>
    <div class="row">
       
      <div v-for="post in posts" :key="post.post_id" style="background-color:lavender;margin-left: auto;" 
      v-bind:style="{border: '1px solid black',padding: '2px'}">	  
      <div class="col-sm-3"> 
        <p><h5>{{post.title}}</h5></p>
        <router-link class="link-style" :to="'/post/'+ post.post_id">View full post -></router-link>
        
        
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
      follow:null,
      imagesrc:null      
    }},
  methods:
      {async getouDetails() {
        const url = `http://127.0.0.1:5000/getuser/${this.$route.params.uid}`;
       await fetch(url,{method:"GET",headers: {"Content-Type":"application/json"}})
          .then(resp => resp.json())
          .then(data => {this.details= data;})
          .catch(error => {console.log(error);});
          this.getimage()},

      getouPosts() {
        const url=`http://127.0.0.1:5000/getuserposts/${this.$route.params.uid}`;
        fetch(url,{method:"GET",headers: {"Content-Type":"application/json"}})
          .then(resp => resp.json())
          .then(data => {this.posts=data;})
          .catch(error => {console.log(error);})},

      followcheck() {
            const url=`http://127.0.0.1:5000/followcheck/${this.$route.params.uid}`;
          fetch(url,{method:"GET",headers: {"Content-Type":"text/html"}})
              .then(resp => resp.text())
              .then(data => {this.follow= data;})
              .catch(error => {console.log(error);})},

      followuser() {
        const url=`http://127.0.0.1:5000/follow/${this.$route.params.uid}`;
        fetch(url,{method:"GET",headers: {"Content-Type":"text/html"}})
        .catch(error => {console.log(error);});
        this.getouDetails();
        this.followcheck();
        this.$router.go();
        },

      unfollowuser() {
        const url=`http://127.0.0.1:5000/unfollow/${this.$route.params.uid}`;
        fetch(url,{method:"GET",headers: {"Content-Type":"text/html"}})
        .catch(error => {console.log(error);});
        this.getouDetails();
        this.followcheck();
        this.$router.go();
        },
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
              }
        
      },
      created(){this.getouDetails();this.getouPosts();this.followcheck()}
  })

  export default ouser;