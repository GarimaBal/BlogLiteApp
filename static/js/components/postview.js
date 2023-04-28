const postview = {
  template:
  `
  <div class="container mt-5">
  <h1>{{post.title}}</h1>
  <p>{{post.description}}</p>
  <div style="max-width: 500px;">
  <img :src="image" class="img-responsive" width="300" height="300" 
  alt="Image" style="max-width: 100%; height: auto;"/>
  </div>
  <h6>Created by: {{post.author}}</h6>
  <h6>Last updated: {{post.last_update.substring(0,16)}}</h6>
  <div v-if="cu.id===post.id"> 
  <span style="margin-right: 10px;">
         <button @click="editpageredirect(post.post_id)">Edit</button></span>
         <button @click="confirmdelete(post.post_id)">Remove</button></p>
            <div v-if="showconfirm" style="background-color:darkgray;">
              <p>Are you sure you want to delete this post?</p>
              <button @click="deletepost(post.post_id)">Yes</button>
              <button @click="canceldelete">No</button>
            </div>
  </div>
  
  </div>`,
    data: function(){
      return{          
        post:null,
        pid:null,
        cupost:null,
        cu:null,
        showconfirm:false,
        image:null
      }
    },
    
    methods: {
      async getPost() {
      this.pid=this.$route.params.pid
      const url=`http://127.0.0.1:5000/getpost/${this.pid}`;
      await fetch(url,{method:"GET",headers: {"Content-Type":"application/json"}})
        .then(resp => resp.json())
        .then(data => {this.post=data;})
        .catch(error => {console.log(error);});
        this.checkifcupost();
        this.getimage()
        },
      async checkifcupost(){
        const url=`http://127.0.0.1:5000/getcu`;
        await fetch(url,{method:"GET",headers: {"Content-Type":"application/json"}})
        .then(resp => resp.json())
        .then(data => {this.cu=data;})
        },
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
               this.$router.push('/')
        },
        canceldelete(){
          this.showconfirm = false;
        },
        editpageredirect(postid){
          this.pid = postid;
          this.$router.push(`/postedit/${this.pid}`);},
        getimage() {
          const url = `http://127.0.0.1:5000/postp/${this.post.post_id}`
          fetch(url)
          .then(response => {
          if (response.headers.get('content-type').startsWith('text/')) {
           return response.text();} 
          else {return response.blob();}})
           .then(data => {if (typeof data === 'string') {
            this.image = data;} 
            else {
                const blob = new Blob([data], { type: 'image/png' })
                const reader = new FileReader()
                reader.onload = () => {
                this.image = reader.result}
                reader.readAsDataURL(blob)}
                      })}        
        },
    created(){this.getPost()}
  }
export default postview