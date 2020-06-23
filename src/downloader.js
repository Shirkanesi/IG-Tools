function getBaseImage(){
  if(window.location.href.toLocaleLowerCase().indexOf("instagram") != -1){
    // Instagram integration
    if(window.location.href.indexOf("/p/") != -1 || window.location.href.indexOf("/tv/") != -1){
      let imageName = window.location.href.split("instagram.com")[1];

      var request = new XMLHttpRequest();
      request.open('GET', 'https://www.instagram.com/graphql/query/?query_hash=8c1ccd0d1cab582bafc9df9f5983e80d&variables={"shortcode":"'+imageName.replace("/p/", "").replace("/tv/", "").split("/")[0]+'","child_comment_count":3,"fetch_comment_count":40,"parent_comment_count":24,"has_threaded_comments":true}', false);  // `false` makes the request synchronous
      request.send(null);

      if (request.status === 200) {
        //console.log(request.responseText);
        let json = JSON.parse(request.responseText);
        if(json.data.shortcode_media.__typename != "GraphSidecar"){
          // Single post
          let url = "";
          if(!json.data.shortcode_media.is_video){
            url = json.data.shortcode_media.display_resources[json.data.shortcode_media.display_resources.length-1].src;
          }else{
            url = json.data.shortcode_media.video_url;
          }
          window.open(url, "_blank");
        }else{
          // Multi-post
          let toOpen = [];
          console.log(json);
          for(post of json.data.shortcode_media.edge_sidecar_to_children.edges){
            if(!post.node.is_video){
              toOpen.push(post.node.display_resources[post.node.display_resources.length-1].src);
            }else{
              toOpen.push(post.node.video_url);
            }
          }
          buildSelector(toOpen.reverse());

        }
      }
    }else if(window.location.href.indexOf("/highlights/") != -1){
      saveStoryHighlights();
    }else if(window.location.href.indexOf("stories/tags/") != -1){
      saveStoryHashtag();
    }else if(window.location.href.indexOf("/stories/") != -1){
      saveStory();
    }else if(window.location.href.indexOf("/direct/") != -1){
      saveDirectMessage();
    }else{
      alert("Bitte erst ein Bild anklicken!");
      return;
    }
  }else if(window.location.href.toLocaleLowerCase().indexOf("tiktok") != -1){
    // TikTok integration.
    if(window.location.href.indexOf("/video/") != -1){
      saveTikTok();
    }
  }else if(window.location.href.toLocaleLowerCase().indexOf("zdf") != -1){
    // TikTok integration can also be used for this purpose.
    // Have fun with it @fafa_60
    console.log("ZDF");
    saveTikTok();
  }
}

function saveDirectMessage(){
  if(document.getElementsByClassName("m5WL8").length != 0){
    window.open(document.getElementsByClassName("m5WL8")[0].children[0].src, "_blank");
  }else{
    window.open(document.getElementsByClassName("_3axN1")[0].src, "_blank");
  }
}

function saveTikTok(){
  if(document.getElementsByTagName("video")[0] != undefined){
    if(document.getElementsByTagName('video')[0].src.indexOf("blob:") == -1){
      window.open(document.getElementsByTagName("video")[0].src, "_blank");
    }else{
      alert("Dieses Video kann leider nicht heruntergeladen werden :(");
    }
  }else{
    alert("Leider konnte kein Video gefunden werden ¯\\_(ツ)_/¯");
  }
}

function saveStory(){
  // https://www.instagram.com/graphql/query/?query_hash=0a85e6ea60a4c99edc58ab2f3d17cfdf&variables={"reel_ids":["2275456230"],"location_ids":[],"precomposed_overlay":false}
  /*
    reel_ids: user-id
  */

  let userId = getUserId(window.location.href.split("/stories/")[1].split("/")[0]);
  let storyId = window.location.href.split("/stories/")[1].split("/")[1].split("/")[0];

  var request = new XMLHttpRequest();
  request.open('GET', 'https://www.instagram.com/graphql/query/?query_hash=0a85e6ea60a4c99edc58ab2f3d17cfdf&variables={"reel_ids":["'+userId+'"],"location_ids":[],"precomposed_overlay":false}', false);  // `false` makes the request synchronous
  request.send(null);

  if (request.status === 200) {
    //console.log(request.responseText);
    let json = JSON.parse(request.responseText);
    let url = "";
    // console.log(json.data.reels_media[0].items);
    for(item of json.data.reels_media[0].items){
      if(item.id == storyId){
        if(item.is_video){
          url = item.video_resources[item.video_resources.length-1].src;
        }else{
          url = item.display_resources[item.display_resources.length-1].src;
        }
      }
    }
    window.open(url, "_blank");
  }
}


function saveStoryHighlights(){
  // https://www.instagram.com/graphql/query/?query_hash=0a85e6ea60a4c99edc58ab2f3d17cfdf&variables={"reel_ids":[],"tag_names":[],"location_ids":[],"highlight_reel_ids":["18057431617119761"],"precomposed_overlay":false,"show_story_viewer_list":true,"story_viewer_fetch_count":50,"story_viewer_cursor":"","stories_video_dash_manifest":false}

  storyId = window.location.href.split("/stories/highlights/")[1].split("/")[0];

  var request = new XMLHttpRequest();
  request.open('GET', 'https://www.instagram.com/graphql/query/?query_hash=0a85e6ea60a4c99edc58ab2f3d17cfdf&variables={"reel_ids":[],"tag_names":[],"location_ids":[],"highlight_reel_ids":["'+storyId+'"],"precomposed_overlay":false,"show_story_viewer_list":true,"story_viewer_fetch_count":50,"story_viewer_cursor":"","stories_video_dash_manifest":false}', false);  // `false` makes the request synchronous
  request.send(null);
  let toOpen = [];
  if (request.status === 200) {
    let json = JSON.parse(request.responseText);
    let url = "";
    console.log(json, storyId);
    for(item of json.data.reels_media[0].items){
      if(item.is_video){
        url = item.video_resources[item.video_resources.length-1].src;
      }else{
        url = item.display_resources[item.display_resources.length-1].src;
      }
      toOpen.push(url);
    }
    buildSelector(toOpen);
  }
}


function saveStoryHashtag(){
  // https://www.instagram.com/graphql/query/?query_hash=0a85e6ea60a4c99edc58ab2f3d17cfdf&variables={"reel_ids":[],"tag_names":[],"location_ids":[],"highlight_reel_ids":["18057431617119761"],"precomposed_overlay":false,"show_story_viewer_list":true,"story_viewer_fetch_count":50,"story_viewer_cursor":"","stories_video_dash_manifest":false}

  storyId = window.location.href.split("/stories/tags/")[1].split("/")[0];

  var request = new XMLHttpRequest();
  request.open('GET', 'https://www.instagram.com/graphql/query/?query_hash=0a85e6ea60a4c99edc58ab2f3d17cfdf&variables={"reel_ids":[],"tag_names":["'+storyId+'"],"location_ids":[],"highlight_reel_ids":[],"precomposed_overlay":false,"show_story_viewer_list":true,"story_viewer_fetch_count":50,"story_viewer_cursor":"","stories_video_dash_manifest":false}', false);  // `false` makes the request synchronous
  request.send(null);
  let toOpen = [];
  if (request.status === 200) {
    let json = JSON.parse(request.responseText);
    let url = "";
    console.log("Hashtag", json, storyId);
    for(item of json.data.reels_media[0].items){
      if(item.is_video){
        url = item.video_resources[item.video_resources.length-1].src;
      }else{
        url = item.display_resources[item.display_resources.length-1].src;
      }
      toOpen.push(url);
    }
    buildSelector(toOpen.reverse());
  }
}

function getUserId(userName){
  var request = new XMLHttpRequest();
  request.open('GET', 'https://www.instagram.com/'+userName+'/?__a=1', false);
  request.send(null);

  if (request.status === 200) {
    let json = JSON.parse(request.responseText);
    return json.logging_page_id.split("_")[1];
  }
  return undefined;
}

function buildSelector(urlList){
  let html = "<title>Post-Downloader by Julian</title>";
  for(url_ of urlList.reverse()){
    if(url_.indexOf(".mp4") != -1){
      // video
      html += '<a href="'+url_+'" target="_blank"><video width="360"><source src="'+url_+'" type="video/mp4" /></video></a>';
    }else{
      // image
      html += '<a href="'+url_+'" target="_blank"><img src="'+url_+'" width="360" /></a>';
    }
  }
  // console.log(html);
  w = window.open("selector.html");
  w.onload = function(){
    w.document.write(html);
    let vids = w.document.getElementsByTagName("video");
    for(vid of vids){
      vid.volume = 0;
      vid.loop = true;
      vid.play();
    }
  }
}


// start everything
getBaseImage();
