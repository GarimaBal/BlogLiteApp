import home from "./components/home.js"
import search from "./components/search.js"
import followers from "./components/followersList.js"
import following from "./components/followingList.js"
import ouser from "./components/ouser.js"
import postview from "./components/postview.js"
import createpost from "./components/createpost.js"
import feed from "./components/feed.js"
import postedit from "./components/postedit.js"

const routes = [
    {path : "/", component : home, props:true},
    {path : "/followers", component : followers},
    {path : "/following", component : following},
    {path : "/search", component : search},
    {path : "/ouser/:uid", component : ouser},
    {path : "/post/:pid", component : postview},
    {path : "/createpost", component : createpost},
    {path : "/myfeed", component : feed},
    {path : "/postedit/:pid", component : postedit}
    ]
    
    const router = new VueRouter({
      routes
    })

    export default router