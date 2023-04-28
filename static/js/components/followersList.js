const followers = {
    template:
    `
    <div class="container mt-5">
    <div v-if="following===[]"><h1>You haven't followed any users yet.</h1></div>
    <div v-else>
  
    <h1> List of users who follow you</h1>
     <div v-for="follower in following" :key="follower.id">
      <router-link class="link-style"	:to="'/ouser/' + follower.id">{{follower.email}}</router-link>
      <p><button v-if="follower.followback===false" @click="followuser(follower.id)">Follow</button>
      <button @click="unfollowuser(follower.id)">Unfollow</button></p>
     </div>
    </div>
    </div>`,
      data: function(){
        return{          
          following:null,
          uid:null
        }
      },
      
      methods: {getFollowing() {
        const url=`http://127.0.0.1:5000/followerlist`;
        fetch(url,{method:"GET",headers: {"Content-Type":"application/json"}})
          .then(resp => resp.json())
          .then(data => {this.following=data;})
          .catch(error => {console.log(error);})},

          followuser(usid) {
            this.uid=usid;
            const url=`http://127.0.0.1:5000/follow/${this.uid}`;
            fetch(url,{method:"GET",headers: {"Content-Type":"text/html"}})
            .catch(error => {console.log(error);});
            this.$router.go();
            },
    
          unfollowuser(usid) {
            this.uid=usid;
            const url=`http://127.0.0.1:5000/unfollow/${this.uid}`;
            fetch(url,{method:"GET",headers: {"Content-Type":"text/html"}})
            .catch(error => {console.log(error);});
            this.$router.go();
            }},
      created(){this.getFollowing()}}
  export default followers