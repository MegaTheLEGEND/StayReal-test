import { For, onMount, Show, createSignal, createMemo, type Component } from "solid-js";
import { createStore } from "solid-js/store";
import MdiCog from '~icons/mdi/cog';
import me from "~/stores/me";
import ProfilePicture from "~/components/profile-picture";
import BottomNavigation from "~/components/bottom-navigation";
import feed from "~/stores/feed";

const Chip: Component<{ content: string }> = (props) => (
  <div class="bg-white/15 rounded-full py-1.5 px-2.5">
    <p class="text-xs sm:text-sm md:text-base">{props.content}</p>
  </div>
);

const ProfileView: Component = () => {
  onMount(() => me.refetch());

  const posts = createMemo(() =>
    [...(feed.get()?.userPosts?.posts ?? [])].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    )
  );

  const [currentIndex, setCurrentIndex] = createSignal(0);
  const [swapMap, setSwapMap] = createStore<Record<string, boolean>>({});

  const toggleSwap = (postId: string) => {
    setSwapMap(postId, v => !v);
  };

  return (
    <>
      <header class="pt-[env(safe-area-inset-top)]">
        <nav class="flex items-center justify-end px-8 h-[72px]">
          <a href="/settings" aria-label="Settings">
            <MdiCog class="text-xl" />
          </a>
        </nav>
      </header>

      <main class="pb-32 px-8 space-y-8 mb-[env(safe-area-inset-bottom)]">
        <Show when={me.get()} fallback={<p class="text-center pt-8 animate-pulse">Loading your profile...</p>}>
          {me => (
            <>
              <div class="flex flex-col items-center text-center gap-4">
                <ProfilePicture
                  username={me().username}
                  media={me().profilePicture}
                  fullName={me().fullname}
                  size={168}
                  textSize={64}
                />
                <div class="flex flex-col">
                  <h1 class="text-2xl font-700 line-height-none">
                    {me().fullname}
                  </h1>
                  <p class="text-white/60">
                    {me().username} ({me().isPrivate ? "PRIVATE" : "PUBLIC"})
                  </p>
                </div>
                <p>{me().biography}</p>
                <div class="flex items-center justify-center flex-wrap gap-2">
                  <Chip content={`${me().streakLength} days`} />
                  <Chip content={`${me().location} (${me().countryCode})`} />
                  <Chip content={new Date(me().birthdate).toLocaleDateString()} />
                  <Chip content={me().gender} />
                </div>
              </div>

              <div class="flex justify-center gap-2 md:gap-6">
                <For each={me().realmojis}>
                  {realmoji => (
                    <div class="relative flex-shrink-0">
                      <img
                        class="w-12 h-12 sm:(w-16 h-16) md:(w-20 h-20) rounded-xl border-2 border-white/25"
                        src={realmoji.media.url}
                        alt={realmoji.emoji}
                      />
                      <p class="text-xs sm:text-sm md:text-base absolute -bottom-2 -right-2 rounded-full p-1.5">
                        {realmoji.emoji}
                      </p>
                    </div>
                  )}
                </For>
              </div>

              <div class="mt-6 space-y-4">
                <div class="flex justify-between items-center">
                  <button
                    class="text-sm px-2 py-1 bg-white/10 rounded"
                    onClick={() => setCurrentIndex(i => (i - 1 + posts().length) % posts().length)}
                  >
                    ←
                  </button>
                  <p class="text-xs text-white/70">
                    Today's post {currentIndex() + 1} of {posts().length}
                  </p>
                  <button
                    class="text-sm px-2 py-1 bg-white/10 rounded"
                    onClick={() => setCurrentIndex(i => (i + 1) % posts().length)}
                  >
                    →
                  </button>
                </div>

                <div class="relative w-full overflow-hidden h-[30vh] flex justify-center items-center">
                  <div
                    class="flex transition-transform duration-500 ease-in-out"
                    style={{
                      transform: `translateX(-${currentIndex() * 100}%)`,
                      width: `${posts().length * 100}%`,
                    }}
                  >
                    <For each={posts()}>
                      {(post) => {
                        const isSwapped = () => swapMap[post.id] ?? false;

                        const mainImg = () => (isSwapped() && post.secondary ? post.secondary : post.primary);

                        const overlayImg = () => (isSwapped() && post.secondary ? post.primary : post.secondary);

                        return (
                          <div class="w-full flex-shrink-0 flex justify-center items-center relative">
                            <div class="relative w-full h-[30vh] aspect-[3/5] max-w-[50vw] rounded-md shadow-md overflow-hidden">
                              <img
                                src={mainImg().url}
                                alt="Main"
                                class="absolute inset-0 w-full h-full object-cover z-0"
                              />

                              <Show when={overlayImg()}>
                                <img
                                  src={overlayImg()!.url}
                                  alt="Swap"
                                  class="absolute top-2 right-2 w-16 h-22 object-cover rounded-md z-10 cursor-pointer border border-white/50"
                                  onClick={() => toggleSwap(post.id)}
                                />
                              </Show>

                              <div class="absolute bottom-0 left-0 right-0 bg-black/50 rounded-md text-white p-2 text-xs sm:text-sm">
                                <p>Realmojis: {post.realMojis?.length || 0}</p>
                                <p>Comments: {post.comments?.length || 0}</p>
                              </div>
                            </div>
                          </div>
                        );
                      }}
                    </For>
                  </div>
                </div>
              </div>
              <div>
                <p class="text-white/50 text-center text-xs md:text-sm">
                  Joined the {new Date(me().createdAt).toLocaleString()}
                </p>
              </div>
            </>
          )}
        </Show>
      </main>

      <BottomNavigation />
    </>
  );
};

export default ProfileView;
