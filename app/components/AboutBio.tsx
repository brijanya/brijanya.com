export function AboutBio() {
    return (
        <div className="flex flex-col gap-4">
            <h1 className="text-2xl font-bold text-white mb-2">Hi, I&apos;m</h1>
            <pre className="text-green-500 font-bold block text-xs sm:text-sm whitespace-pre-wrap leading-tight mb-2">
                {` _               _                             
| |             (_)                            
| |__   _ __  _  _   __ _  _ __   _   _   __ _ 
| '_ \\ | '__|| || | / _\` || '_ \\ | | | | / _\` |
| |_) || |   | || || (_| || | | || |_| || (_| |
|_.__/ |_|   |_|| | \\__,_||_| |_| \\__, | \\__,_|
               _/ |                __/ |       
              |__/                |___/        `}
            </pre>
            <p>
                What you are seeing is my personal website. After successfully failing to create
                a UI that I liked, I had an idea to make my website look, live, and breathe like a
                terminal, <span className="text-green-400 italic">and I love it</span>.
            </p>
            <p>
                I am a banker by profession, but I am a passionate for software development, building scalable
                applications and exploring new technologies.I hope for this site to be a collections of articles
                that i read, write and find interesting, projects I create, and also a place where I can share my
                thoughts and ideas with the world.
            </p>
            <p>
                This website is a work in progress. I will add small tools to it that can be useful to me and hopefully to you too.
                When you reach home page type <span className="text-green-400 italic">'help'</span> to see the list of commands. Right
                now you wont see a lot of commands but slowly I will add more. If you have any suggestions, feel free to reach out to me.
                Type <span className="text-green-400 italic">'contact'</span> to get my contact information.
            </p>

        </div>
    );
}
