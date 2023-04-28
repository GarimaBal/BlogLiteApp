const feed = Vue.component("feed", {
  template : `
  <div>    
  <div class="row">
  <div v-for="post in posts" :key="post.postID" class="col-sm-5" style="background-color:lavender;margin-left: 10px;
  margin-top: 10px;margin-right: 10px;margin-bottom: 10px; padding: 5px; overflow-wrap: break-word;">
    <h4>{{post.title}}</h4>
    <div class="grid" style="--bs-columns: 12">
    <div class="g-col-12">
    <p v-if="post.description <= 100">{{post.description}}</p>
    <p v-else> {{post.description.substring(0,100)}}...</p>
    </div>           
    </div>
    <p>By:<router-link class="link-style" :to="'/ouser/'+ post.id">{{post.email}}</router-link></p>
    <p><router-link class="link-style" :to="'/post/'+ post.postID">View full post</router-link></p>
  </div>      
</div>
</div>
              `
,
data: function(){
  return{
    posts:null,
    
  }
},

methods:
    {
      getPosts() {
          fetch(`http://127.0.0.1:5000/feed`,
           {method:"GET",
           headers: {
             "Content-Type":"application/json"}})
             .then(resp => resp.json())
             .then(data => {this.posts= data;})
             .catch(error => {console.log(error);})}
      
    },
   
    created(){this.getPosts()}
})

export default feed;
