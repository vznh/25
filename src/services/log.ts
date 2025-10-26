import { Post } from "@/types/context";

interface Structure {
  tag(post: Post): Promise<void>;
}

class Console {

}
