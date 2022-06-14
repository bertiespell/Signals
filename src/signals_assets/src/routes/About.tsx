import { Link } from "react-router-dom";

export default function About() {
	return (
		<div className="overflow-y-auto">
			<div
				className={`min-w-0 flex-1 h-full flex flex-col  lg:order-last p-8`}
			>
				<div className="p-8">
					<h2 className="text-base text-signalBlue-600 font-semibold tracking-wide uppercase">
						Create meaningful connections
					</h2>
					<h3 className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
						Welcome to Signals
					</h3>
					<div className="mt-5 prose prose-signalBlue text-gray-500 mx-auto lg:max-w-none lg:row-start-1 lg:col-start-1 row-span-3">
						<p className="text-lg text-gray-500">
							I was inspired to build Signals after moving to a
							new city and finding it hard to connect with new
							people. It occurred to me that I pass the same
							strangers every day who share my interests and
							hobbies - we live in the same building, go to the
							same gym, enjoy the same cafes or play the same
							sports. Despite an epidemic of loneliness, crowded
							cities and all of us carrying devices which
							constantly broadcast our location to private
							companies... it seems harder than ever to connect
							with one another in meaningful ways. Signals
							presents an opportunity to re-think social media to
							put connection at the heart.
						</p>
						<p className="text-lg text-gray-500">
							Signals is built as a <b>DAO</b>, meaning that its
							users control how it operates and are incentivised
							through the <b>Signals Token</b> to interact with
							the map and maintain the quality of the data.
							Currently it supports leaving three types of signals
							- <b>Chats</b>, <b>Trades</b> and <b>Events</b>. Any
							user with sufficient tokens can{" "}
							<Link to={"/profile"}>
								see the state of the system
							</Link>
							, and make proposals on how Signals should be run.
						</p>
						<p className="text-lg text-gray-500">
							Some ideas of how to use the <b>Chat Signal</b>:
						</p>
						<ul>
							<li>Finding a language exchange partner</li>
							<li>Meeting someone to play sports with</li>
							<li>
								Searching for a lost connection... someone who's
								number you regret not asking for
							</li>
							<li>Communicating and organizing with neighbors</li>
							<li>
								Creating a public forum page for your business
								or cafe
							</li>
							<li>
								Reporting incidents, repairs and local
								infrastructure problems
							</li>
							<li>Looking for lost pets</li>
						</ul>

						<p className="text-lg text-gray-500">
							Signals also supports the <b>Event Signal</b>. You
							can use this to broadcast an event taking place -
							maybe a talk, meetup, party, book launch or anything
							really! There's also the option to make the event
							ticketed and to set the number of available tickets.
						</p>
						<p className="text-lg text-gray-500">
							With the <b>Trade Signal</b> you can list goods and
							services for sale, the way you would on Gumtree or
							Wallapop. Perhaps you're looking for a cleaner,
							nanny or teacher, leaving a trade signal is the
							perfect way to find someone. It also encourages
							people to buy second hand, which is good for the
							planet.
						</p>
						<p className="text-lg text-gray-500">
							Where to go from here? I'd like to integrate a{" "}
							<b>DAO Launcher</b> into the app, to allow users who
							have discovered each other to easily launch
							templated DAOs to govern their communities, spaces
							or projects. But I have many many other ideas for
							it, which you can see over on the{" "}
							<a href={"https://github.com/bertiespell/Signals"}>
								Github Page
							</a>
							.
						</p>
						<p className="text-lg text-gray-500">
							I'd love the opportunity to develop these ideas
							further, and implement a production ready version of
							this idea. I've loved building on the ICP and have
							felt very inspired by the idea of building a
							completely decentralized application. Thanks so much
							for reading if you made it this far. I'm always very
							happy to hear feedback and of course - to make new
							connections - so feel free to reach out.
						</p>
						<p className="text-lg text-gray-500">
							Who am I? I'm a full stack developer, I've worked
							helping to build a 3D graphics library, a blockchain
							and most recently building backend and payment
							systems for millions of users at Sketch. I'm really
							passionate about trying to use blockchain to solve
							real world problems, and building beautiful products
							which benefit people. I'm currently in the process
							of turning my ideas into something more concrete, I
							hope to find a path to be able to sustain myself
							building in this space... so, if you know of any, or
							want to link up, let me know. You can find me on any
							of the links below.
						</p>
						<p className="text-lg text-gray-500">
							Made with &lt;3 by{" "}
							<a
								href="https://linktr.ee/bertiespell"
								target="_blank"
							>
								Bertie Spell
							</a>
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
