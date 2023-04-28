const following = {
    template:
    `
    <div class="container mt-5">
    <h1> List of users you are following</h1>
     <div v-for="follower in followerss" :key="follower.id">
      <router-link class="link-style"	:to="'/ouser/' + follower.id">{{follower.email}}</router-link>
      <p><button @click="unfollowuser(follower.id)">Unfollow</button></p>


     </div>
    </div>`,
      data: function(){
        return{          
          followerss:null,
          uid:null
        }
      },
      
      methods: {getFollowers() {
        const url=`http://127.0.0.1:5000/followinglist`;
        fetch(url,{method:"GET",headers: {"Content-Type":"application/json"}})
          .then(resp => resp.json())
          .then(data => {this.followerss=data;})
          .catch(error => {console.log(error);})},
          unfollowuser(usid) {
            this.uid=usid;
            const url=`http://127.0.0.1:5000/unfollow/${this.uid}`;
            fetch(url,{method:"GET",headers: {"Content-Type":"text/html"}})
            .catch(error => {console.log(error);});
            this.$router.go();
            }
        },
      created(){this.getFollowers()}}
  export default following