<?php

$data = json_decode(file_get_contents("./pd9b8ygr4dzk0a6e10y98hqspp3q58biwdn4o5qbbui3s76zi0pvggzjazmy1prdwjl5go2zqplsb5y6dz7us7p7dnke0dqxcqszmwpsf821h48ljgu8feaiko3aluqa.json"), 1);

$users = $data['users'];
$posts = $data['posts'];
$comments = $data['comments'];

echo "<pre>";

foreach ($users as $user) {
    echo "\n\n\n\nThe user with the id: ".$user['id']." has the username ".$user['name'].", their password hash is ".$user['password'].".\nTheir email address is ".$user['email'].".\nThis user has ".count($user['followers'])." followers, they are as follows: \n\n";
    foreach ($user['followers'] as $follower) {
        echo $users[strval($follower)]['name']." - follows this user.\n";
    }
    echo "\nThis user is following ".count($user['following'])." users, they are as follows: \n\n";
    foreach ($user['following'] as $following) {
        echo "This user is following - ".$users[strval($following)]['name'].".\n";
    }
    echo "\n";
    if (isset($user['verified_email'])) {
        if ($user['verified_email']) {
            echo "This user has verified their email.\n";
        }else{
            echo "This user has not verified their email.\n";
        }
    }else{
        echo "This user has not verified their email.\n";
    }
    if (isset($user['verified_account'])) {
        if ($user['verified_account']) {
            echo "This user account is verified.\n";
        }else{
            echo "This user account is not verified.\n";
        }
    }else{
        echo "This user account is not verified.\n";
    }
    if (isset($user['staff_account'])) {
        if ($user['staff_account']) {
            echo "This user account is a member of the staff.\n";
        }else{
            echo "This user account is not a member of the staff.\n";
        }
    }else{
        echo "This user account is not a member of the staff.\n";
    }
    
    echo "This account was created at: ".gmdate("Y-m-d H:i:s", $user['created_at']).".\n";
    
    echo "This user has recent been logged in at the following ip address(es): ".implode(", ", $user['recent_logins']).".\n";
    
    echo "The following posts have been created by ".$user['name'].": \n\n";
    
    foreach ($user['posts'] as $post) {
        echo "The post with the id: ".$posts[strval($post)]['id']." has the title: ".$posts[strval($post)]['title'].", the description: ".$posts[strval($post)]['description'].".\nIt was created at: ".gmdate("Y-m-d H:i:s", $posts[strval($post)]['time']).".\nIt has been liked by: ";
        $userNames = array();
        foreach ($posts[strval($post)]['likes'] as $like) {
            array_push($userNames, $users[strval($like)]['name']);
        }
        echo implode(", ", $userNames);
        echo ".\nTherefore it has ".count($posts[strval($post)]['likes'])." likes.\nThis post also has ".count($posts[strval($post)]['dislikes'])."\n";
        echo "This post has ".count($posts[strval($post)]['comments'])." comments, they are as follows: ";
        foreach ($posts[strval($post)]['comments'] as $postComment) {
            echo "\n\n";
            $comment = $comments[strval($postComment)];
            echo "This comment ID is ".$comment['id'].".\n";
            echo "This comment has been written by ".$users[strval($comment['author'])]['name'].".\n";
            echo "The comment says: ".$comment['content'].".\n";
            echo "The comment has ".count($comment['likes'])," likes and ".count($comment['dislikes'])." dislikes. \n\n";
            foreach ($comment['likes'] as $like) {
                echo $users[strval($like)]['name']," has liked this comment.\n";
            }
            foreach ($comment['dislikes'] as $like) {
                echo $users[strval($like)]['name']," has disliked this comment.\n";
            }
            echo "\n";
        }
    }
}
?>